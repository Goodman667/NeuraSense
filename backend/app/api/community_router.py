"""
Community API Router - Full Interactive Version

Endpoints for real community with posts, replies, and interactions
Uses Supabase for persistent storage with file fallback.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import json
from pathlib import Path
import uuid

from ..services.database.supabase_client import get_supabase_client

router = APIRouter(prefix="/community", tags=["Community"])

# Data storage (fallback)
DATA_DIR = Path("./data")
COMMUNITY_FILE = DATA_DIR / "community_posts.json"

# Get Supabase client
_supabase = get_supabase_client()

# Default posts for initialization
DEFAULT_POSTS = [
    {
        "id": str(uuid.uuid4()),
        "content": "今天阳光很好，感恩这个美好的早晨",
        "likes": 12,
        "category": "gratitude",
        "created_at": datetime.now().isoformat(),
        "author": "小太阳",
        "replies": []
    },
    {
        "id": str(uuid.uuid4()),
        "content": "坚持了7天日记，给自己一个大大的赞！",
        "likes": 8,
        "category": "achievement",
        "created_at": datetime.now().isoformat(),
        "author": "坚持帝",
        "replies": []
    },
    {
        "id": str(uuid.uuid4()),
        "content": "每一天都是新的开始，加油！",
        "likes": 15,
        "category": "encouragement",
        "created_at": datetime.now().isoformat(),
        "author": "正能量派",
        "replies": []
    },
    {
        "id": str(uuid.uuid4()),
        "content": "感谢朋友今天的陪伴，有朋友真好",
        "likes": 9,
        "category": "gratitude",
        "created_at": datetime.now().isoformat(),
        "author": "暖心人",
        "replies": []
    },
    {
        "id": str(uuid.uuid4()),
        "content": "完成了第一次呼吸练习，感觉很放松，推荐大家试试！",
        "likes": 20,
        "category": "achievement",
        "created_at": datetime.now().isoformat(),
        "author": "深呼吸",
        "replies": []
    },
]

# Initialize file storage if Supabase not available
if _supabase is None:
    if not DATA_DIR.exists():
        DATA_DIR.mkdir(exist_ok=True)
    if not COMMUNITY_FILE.exists():
        COMMUNITY_FILE.write_text(json.dumps(DEFAULT_POSTS, ensure_ascii=False, indent=2))


class NewPost(BaseModel):
    """Create a new post"""
    content: str
    category: str  # gratitude, encouragement, achievement


class NewReply(BaseModel):
    """Reply to a post"""
    content: str


class PostResponse(BaseModel):
    """Response after creating post"""
    success: bool
    post_id: str
    message: str = ""


def _load_posts() -> List[dict]:
    """Load posts from Supabase or file"""
    if _supabase:
        try:
            response = _supabase.table("community_posts").select("*").order("created_at", desc=True).execute()
            posts = response.data or []
            # If no posts, initialize with defaults
            if not posts:
                for post in DEFAULT_POSTS:
                    _supabase.table("community_posts").insert(post).execute()
                return DEFAULT_POSTS
            return posts
        except Exception as e:
            print(f"Supabase error loading posts: {e}")
            return []
    else:
        try:
            return json.loads(COMMUNITY_FILE.read_text())
        except:
            return []


def _save_posts(data: List[dict]):
    """Save posts to file (only used for fallback)"""
    if not _supabase:
        COMMUNITY_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2))


def _moderate_content(content: str) -> tuple[bool, str]:
    """Content moderation - returns (is_ok, reason)"""
    if len(content.strip()) < 2:
        return False, "内容太短了"
    if len(content) > 500:
        return False, "内容太长了，请控制在500字以内"
    
    # Block harmful content
    harmful_words = ["死", "自杀", "杀人", "恨", "傻逼"]
    for word in harmful_words:
        if word in content:
            return False, "内容包含不当词汇，请修改后再发布"
    
    return True, ""


@router.post("/post", response_model=PostResponse)
async def create_post(post: NewPost) -> PostResponse:
    """
    Create a new community post (anonymous).
    """
    is_ok, reason = _moderate_content(post.content)
    if not is_ok:
        return PostResponse(success=False, post_id="", message=reason)
    
    new_post = {
        "id": str(uuid.uuid4()),
        "content": post.content.strip()[:500],
        "likes": 0,
        "category": post.category,
        "created_at": datetime.now().isoformat(),
        "author": "匿名用户",
        "replies": [],
    }
    
    if _supabase:
        try:
            _supabase.table("community_posts").insert(new_post).execute()
        except Exception as e:
            print(f"Supabase error creating post: {e}")
            return PostResponse(success=False, post_id="", message="发布失败，请稍后重试")
    else:
        posts = _load_posts()
        posts.insert(0, new_post)
        _save_posts(posts)
    
    return PostResponse(success=True, post_id=new_post["id"], message="发布成功！感谢分享正能量 💜")


@router.get("/posts")
async def get_posts(limit: int = 50, offset: int = 0, category: Optional[str] = None):
    """Get community posts with pagination and optional category filter"""
    posts = _load_posts()
    
    # Filter by category if specified
    if category and category != "all":
        posts = [p for p in posts if p.get("category") == category]
    
    total = len(posts)
    paginated = posts[offset:offset + limit]
    
    return {
        "posts": paginated,
        "total": total,
        "hasMore": offset + limit < total,
    }


@router.post("/like/{post_id}")
async def like_post(post_id: str):
    """Like a post"""
    posts = _load_posts()
    
    for post in posts:
        if post["id"] == post_id:
            post["likes"] = post.get("likes", 0) + 1
            _save_posts(posts)
            return {"success": True, "likes": post["likes"]}
    
    return {"success": False, "error": "Post not found"}


@router.post("/reply/{post_id}")
async def reply_to_post(post_id: str, reply: NewReply):
    """Reply to a post"""
    is_ok, reason = _moderate_content(reply.content)
    if not is_ok:
        return {"success": False, "message": reason}
    
    posts = _load_posts()
    
    for post in posts:
        if post["id"] == post_id:
            new_reply = {
                "id": str(uuid.uuid4()),
                "content": reply.content.strip()[:200],
                "created_at": datetime.now().isoformat(),
            }
            if "replies" not in post:
                post["replies"] = []
            post["replies"].append(new_reply)
            _save_posts(posts)
            return {"success": True, "reply": new_reply}
    
    return {"success": False, "message": "帖子不存在"}


@router.get("/post/{post_id}")
async def get_single_post(post_id: str):
    """Get a single post with all replies"""
    posts = _load_posts()
    
    for post in posts:
        if post["id"] == post_id:
            return {"success": True, "post": post}
    
    raise HTTPException(status_code=404, detail="Post not found")


@router.get("/stats")
async def get_community_stats():
    """Get community statistics"""
    posts = _load_posts()
    
    total_posts = len(posts)
    total_replies = sum(len(p.get("replies", [])) for p in posts)
    total_likes = sum(p.get("likes", 0) for p in posts)
    
    # Category distribution
    categories = {}
    for p in posts:
        cat = p.get("category", "other")
        categories[cat] = categories.get(cat, 0) + 1
    
    return {
        "total_posts": total_posts,
        "total_replies": total_replies,
        "total_likes": total_likes,
        "categories": categories,
    }
