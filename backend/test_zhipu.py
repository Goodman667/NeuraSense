# 直接测试智谱 AI
from zhipuai import ZhipuAI

API_KEY = "b667b5eae22e4780816a8b38a1a32b0d.ZsMkH3UUfvgxyToT"

try:
    client = ZhipuAI(api_key=API_KEY)
    
    response = client.chat.completions.create(
        model="glm-4-flash",
        messages=[
            {"role": "system", "content": "你是一位温暖的心理咨询师"},
            {"role": "user", "content": "你好，我今天很难过"}
        ],
        temperature=0.7,
        max_tokens=200,
    )
    
    print("SUCCESS!")
    print(f"Response: {response.choices[0].message.content}")
    
except Exception as e:
    print(f"ERROR: {type(e).__name__}")
    print(f"Message: {e}")
    import traceback
    traceback.print_exc()
