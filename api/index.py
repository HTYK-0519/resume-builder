import sys
import os

# 현재 디렉터리 및 상위 디렉터리를 sys.path에 추가하여 app.py를 안전하게 참조
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app

# Vercel Serverless WSGI Handler
app = app
