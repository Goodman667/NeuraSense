"""
Mini Program Auth Router

Handles WeChat Mini Program login via wx.login() → jscode2session flow.
Different from public account OAuth — uses its own AppID/AppSecret.
"""

import os
import httpx
import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.auth import auth_service, wechat_oauth_service

router = APIRouter(prefix="/auth/mp", tags=["Mini Program Auth"])

# Mini Program credentials (different from public account)
MP_APP_ID = os.getenv("MP_APP_ID", "")
MP_APP_SECRET = os.getenv("MP_APP_SECRET", "")

JSCODE2SESSION_URL = "https://api.weixin.qq.com/sns/jscode2session"


class MPLoginRequest(BaseModel):
    """小程序登录请求"""
    code: str


class MPLoginResponse(BaseModel):
    """小程序登录响应"""
    token: str
    user_id: str
    is_new: bool


@router.post("/login", response_model=MPLoginResponse)
async def mp_login(request: MPLoginRequest):
    """
    微信小程序登录

    流程：
    1. 接收小程序 wx.login() 返回的 code
    2. 调用微信 jscode2session 接口换取 openid
    3. 查找已绑定用户或自动注册新用户
    4. 生成 session token 返回
    """
    if not MP_APP_ID or not MP_APP_SECRET:
        raise HTTPException(
            status_code=500,
            detail="小程序未配置 MP_APP_ID / MP_APP_SECRET",
        )

    # 1. 调用微信 jscode2session
    params = {
        "appid": MP_APP_ID,
        "secret": MP_APP_SECRET,
        "js_code": request.code,
        "grant_type": "authorization_code",
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(JSCODE2SESSION_URL, params=params)
            data = resp.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"请求微信接口失败: {e}")

    if "errcode" in data and data["errcode"] != 0:
        raise HTTPException(
            status_code=400,
            detail=f"微信登录失败: {data.get('errmsg', 'unknown error')}",
        )

    openid = data.get("openid")
    if not openid:
        raise HTTPException(status_code=400, detail="未获取到 openid")

    # 2. 查找已绑定用户
    linked_user_id = wechat_oauth_service.get_linked_user_id(openid)
    is_new = False

    if linked_user_id:
        # 已有用户，直接登录
        user_id = linked_user_id
    else:
        # 3. 自动注册新用户
        username = f"mp_{openid[:8]}"
        password = secrets.token_urlsafe(16)
        try:
            user = auth_service.register(username, password, nickname="微信用户")
            user_id = user["id"]
        except ValueError:
            # 用户名冲突，加随机后缀
            username = f"mp_{secrets.token_hex(4)}"
            user = auth_service.register(username, password, nickname="微信用户")
            user_id = user["id"]

        # 绑定 openid
        wechat_oauth_service.link_wechat_to_user(openid, user_id)
        is_new = True

    # 4. 创建 session token
    token = auth_service._generate_token()
    session = {
        "token": token,
        "user_id": user_id,
        "created_at": datetime.now().isoformat(),
        "expires_at": (datetime.now() + timedelta(days=7)).isoformat(),
    }

    if auth_service.use_supabase:
        auth_service._supabase_save_session(session)
    else:
        sessions = auth_service._load_sessions()
        sessions.append(session)
        auth_service._save_sessions(sessions)

    return MPLoginResponse(token=token, user_id=user_id, is_new=is_new)
