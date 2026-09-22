import os
import logging
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from google import genai

# 1. 로깅(로그 기록) 설정: 터미널에 요청, 응답, 오류를 보기 쉽게 출력합니다.
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# 2. .env 파일에서 환경변수(API Key)를 안전하게 로드합니다.
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    logger.warning("⚠️ 경고: .env 파일에 GEMINI_API_KEY가 설정되지 않았습니다!")

# 3. Flask 웹 애플리케이션 객체 생성 (Vercel Serverless 환경 대응 절대 경로 설정)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "templates"),
    static_folder=os.path.join(BASE_DIR, "static")
)

# [Route 1] 메인 페이지: 사용자가 웹 브라우저로 접속했을 때 HTML 화면을 보여줍니다.
@app.route("/")
def index():
    logger.info("메인 페이지(/) 접속 요청을 수신했습니다.")
    return render_template("index.html")

# [Route 1-1] PWA 지원: 매니페스트 및 서비스 워커 서빙 라우트
@app.route("/manifest.json")
def manifest():
    return app.send_static_file("manifest.json")

@app.route("/sw.js")
def service_worker():
    response = app.send_static_file("sw.js")
    response.headers["Content-Type"] = "application/javascript"
    response.headers["Service-Worker-Allowed"] = "/"
    return response

# [Route 2] 이력서 및 포트폴리오 생성 API: 프론트엔드 입력을 받아 Gemini AI를 호출합니다.
@app.route("/generate", methods=["POST"])
def generate():
    try:
        # 프론트엔드(JavaScript)에서 전송된 JSON 데이터 수신
        data = request.get_json()
        if not data:
            logger.warning("요청에 JSON 데이터가 전달되지 않았습니다.")
            return jsonify({"success": False, "error": "전송된 데이터가 올바르지 않습니다."}), 400

        # 사용자 입력값 추출
        name = data.get("name", "").strip()
        job_title = data.get("job_title", "").strip()
        experience = data.get("experience", "").strip()
        projects = data.get("projects", "").strip()
        tone = data.get("tone", "전문적이고 설득력 있는").strip()
        prompt_type = data.get("prompt_type", "A").strip()

        # 백엔드 입력값 검증 (필수 입력값 누락 시 오류 반환)
        if not name:
            return jsonify({"success": False, "error": "이름을 입력해주세요."}), 400
        if not job_title:
            return jsonify({"success": False, "error": "지원 직무를 입력해주세요."}), 400
        if not experience:
            return jsonify({"success": False, "error": "주요 경력 사항을 입력해주세요."}), 400
        if not projects:
            return jsonify({"success": False, "error": "수행 프로젝트 경험을 입력해주세요."}), 400

        logger.info(f"[요청 수신] 지원자: {name} | 직무: {job_title} | 톤: {tone} | 프롬프트 모드: {prompt_type}")

        # API Key 유효성 검사
        if not GEMINI_API_KEY or GEMINI_API_KEY == "your_actual_api_key_here":
            logger.error("유효한 GEMINI_API_KEY가 .env에 등록되어 있지 않습니다.")
            return jsonify({
                "success": False,
                "error": "서버에 Gemini API Key가 올바르게 설정되지 않았습니다. .env 파일을 확인해주세요."
            }), 500

        # 프롬프트 엔지니어링: 모드에 따른 프롬프트 분기 (Prompt A vs Prompt B)
        if prompt_type == "B":
            # Prompt B: 전문가 모드 (STAR 기법, 정량적 수치 중심)
            system_instruction = (
                "당신은 글로벌 IT 대기업의 시니어 테크니컬 리크루터입니다. "
                "지원자의 경험을 STAR 기법(Situation, Task, Action, Result)과 측정 가능한 정량적 수치를 바탕으로 "
                "고도로 전문적이고 설득력 있는 국문 Resume 및 Portfolio 초안을 작성해주세요."
            )
            prompt_content = f"""
다음 지원자의 정보를 바탕으로 전문가 수준의 이력서(Resume)와 포트폴리오(Portfolio)를 마크다운(Markdown) 형식으로 작성해주세요.

[지원자 정보]
- 이름: {name}
- 지원 직무: {job_title}
- 희망 어조(Tone): {tone}
- 주요 경력:
{experience}
- 수행 프로젝트:
{projects}

[작성 가이드라인]
1. 어조는 '{tone}' 스타일을 엄격히 반영하세요.
2. 반드시 아래 2가지 대주제로 명확히 나누어 작성하세요:
   # 1. 전문 이력서 (Resume)
   - 직무 전문성을 강조하는 요약 소개 (Professional Summary)
   - 핵심 보유 역량 (Core Skills)
   - 경력 기술 (STAR 기법 및 정량적 성과 중심)
   
   # 2. 포트폴리오 (Portfolio)
   - 프로젝트 개요 및 핵심 역할
   - 문제 해결(Problem Solving) 경험 및 기술적 의사결정
   - 최종 성과 및 배운 점
3. 가독성을 위해 마크다운(#, ##, -, **)을 깔끔하게 사용하세요.
"""
        else:
            # Prompt A: 일반 모드 (표준적이고 직관적인 가독성 중심)
            system_instruction = (
                "당신은 친절하고 전문적인 커리어 컨설턴트입니다. "
                "지원자의 정보를 바탕으로 읽기 쉽고 표준적인 국문 이력서와 포트폴리오 초안을 깔끔하게 작성해주세요."
            )
            prompt_content = f"""
다음 지원자의 정보를 바탕으로 완성도 높은 이력서(Resume)와 포트폴리오(Portfolio)를 마크다운(Markdown) 형식으로 작성해주세요.

[지원자 정보]
- 이름: {name}
- 지원 직무: {job_title}
- 희망 어조(Tone): {tone}
- 주요 경력:
{experience}
- 수행 프로젝트:
{projects}

[작성 가이드라인]
1. 어조는 '{tone}' 느낌을 자연스럽게 살려 작성하세요.
2. 크게 두 파트로 구분하여 작성하세요:
   # 1. 이력서 (Resume)
   - 한눈에 들어오는 자기소개
   - 보유 기술 및 역량
   - 주요 경력 사항 정리
   
   # 2. 포트폴리오 (Portfolio)
   - 주요 프로젝트 소개
   - 담당 역할 및 기여 내용
   - 성과 및 배운 점
3. 마크다운 문법(#, ##, -, **)을 활용해 깔끔한 구조로 작성하세요.
"""

        # Gemini API 호출 (빠르고 가벼운 gemini-3.5-flash-lite 모델)
        logger.info("Gemini API 호출을 전송합니다... (모델: gemini-3.5-flash-lite)")
        client = genai.Client(api_key=GEMINI_API_KEY)

        full_prompt = f"{system_instruction}\n\n{prompt_content}"
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=full_prompt
        )

        result_text = response.text
        logger.info(f"[생성 완료] AI 응답 생성 성공 (생성된 글자 수: {len(result_text)}자)")

        # 성공 결과 반환
        return jsonify({
            "success": True,
            "result": result_text
        })

    except Exception as e:
        logger.error(f"[오류 발생] 처리 중 에러: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "error": f"AI 생성 중 오류가 발생했습니다: {str(e)}"
        }), 500

# 직접 실행 시 서버 구동
if __name__ == "__main__":
    logger.info("AI Resume Builder 웹 서버를 준비합니다.")
    app.run(debug=True, host="127.0.0.1", port=5000)
