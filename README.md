# 🚀 AI Resume & Portfolio Builder

> Google Gemini API와 Flask를 활용하여 맞춤형 국문 이력서(Resume)와 포트폴리오(Portfolio)를 자동으로 생성해 주는 풀스택 웹 애플리케이션입니다.

---

## 📌 프로젝트 소개

사용자가 지원자 이름, 목표 직무, 어조(Tone), 경력 사항 및 프로젝트 경험을 입력하면, Google의 최신 생성형 AI 모델(Gemini)이 직무와 어조에 최적화된 **전문 이력서와 포트폴리오 초안**을 마크다운(Markdown) 형식으로 즉시 생성합니다.

---

## ✨ 핵심 기능 (Features)

1. **상세 맞춤형 입력 폼**
   - 이름, 지원 직무, 어조(Tone & Manner), 주요 경력, 수행 프로젝트 입력
2. **듀얼 프롬프트 엔지니어링 모드 (Prompt Selection)**
   - **Prompt A (일반 모드)**: 가독성이 뛰어난 깔끔하고 표준적인 이력서 및 포트폴리오 초안
   - **Prompt B (전문가 모드)**: STAR 기법(Situation, Task, Action, Result)과 정량적 수치 중심의 심화 서식
3. **철저한 양방향 유효성 검사 (Validation)**
   - 프론트엔드(JavaScript)와 백엔드(Flask) 양쪽에서 필수 입력값 및 형식 검증
4. **사용자 친화적 인터랙션 UI**
   - 세련된 반응형 2단 카드 레이아웃
   - AI 생성 중 실시간 로딩 스피너 제공
   - 친절하고 직관적인 오류 메시지 알림
5. **원클릭 생산성 도구**
   - **📋 전체 복사**: 생성된 마크다운 텍스트를 클립보드에 즉시 복사
   - **💾 .md 다운로드**: `지원자_직무_이력서_포트폴리오.md` 파일로 내 컴퓨터에 즉시 저장
6. **강력한 보안 및 로깅 시스템**
   - `.env`와 `.gitignore`를 통한 Gemini API Key 철저한 비공개 보호
   - 백엔드 터미널에 실시간 요청, 응답, 에러 로그 기록

---

## 🛠️ 기술 스택 (Tech Stack)

### Backend
- **Language**: Python 3.10+
- **Framework**: Flask
- **AI SDK**: `google-genai` (Google Gemini API)
- **Environment**: `python-dotenv`

### Frontend
- **Markup**: HTML5 (Jinja2 Template Engine)
- **Styling**: Vanilla CSS3 (Flexbox & Grid, Responsive Design)
- **Script**: Vanilla JavaScript (ES6+, Fetch API, Blob API)

---

## 📂 디렉터리 구조 (Directory Structure)

```text
resume-builder/
├── app.py                  # 백엔드 서버 및 Gemini API 라우트
├── requirements.txt        # 파이썬 의존성 패키지 목록
├── .env                    # 실제 API Key 설정 (Git 제외)
├── .env.example            # 환경변수 템플릿 파일
├── .gitignore              # Git 버전 관리 제외 목록
├── templates/
│   └── index.html          # 메인 웹 페이지 마크업
└── static/
    ├── css/
    │   └── style.css       # 웹 애플리케이션 디자인 스타일시트
    └── js/
        └── app.js          # 프론트엔드 비동기 통신 및 이벤트 로직
```

---

## 🚀 시작하기 (Getting Started)

### 1. 프로젝트 폴더 이동
```powershell
Set-Location -Path "C:\AI-study\resume-builder"
```

### 2. 가상환경 생성 및 활성화
```powershell
# 가상환경 생성
py -m venv venv

# PowerShell 보안 정책 허용 (최초 1회)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# 가상환경 활성화
.\venv\Scripts\Activate.ps1
```

### 3. 패키지 설치
```powershell
py -m pip install -r requirements.txt
```

### 4. 환경변수(.env) 설정
프로젝트 루트 경로에 `.env` 파일을 생성하고 본인의 Google Gemini API Key를 입력합니다.
```text
GEMINI_API_KEY=AIzaSy...당신의_실제_API_키
```

### 5. 웹 애플리케이션 실행
```powershell
py app.py
```
*(또는 `.\venv\Scripts\python.exe app.py`)*

### 6. 브라우저 접속
웹 브라우저를 열고 아래 주소로 접속합니다:
👉 **`http://127.0.0.1:5000`**

---

## 🔒 보안 가이드라인
- `.env` 파일은 절대 GitHub나 공개 저장소에 커밋하지 않습니다.
- 본 프로젝트는 `.gitignore`를 통해 `.env` 및 `venv/`가 자동으로 Git 추적에서 제외되도록 구성되어 있습니다.
