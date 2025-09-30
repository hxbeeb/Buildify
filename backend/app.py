from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
import os
import traceback
import google.generativeai as genai
from dotenv import load_dotenv

# Local prompts (ported TS → Python)
from prompts import BASE_PROMPT, get_system_prompt, REACT_BASE_PROMPT, NODE_BASE_PROMPT

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://buildify-web-builder.netlify.app",
    "https://buildify-brown.vercel.app",
    "https://buildify.habeebsaleh.dev"
]}})

# Gemini setup
API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
if not API_KEY:
    # Let it proceed; we'll raise in __main__ so Render logs show it clearly
    pass
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')


def _generate_text(prompt: str) -> str:
    resp = model.generate_content(prompt)
    return getattr(resp, 'text', '') or ''


@app.route("/generate", methods=["POST"])
def generate():
    try:
        data = request.get_json(silent=True) or {}
        prompt = data.get("prompt", "")
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        text = _generate_text(prompt)
        return jsonify({"response": text})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/template", methods=["POST"])
def template():
    try:
        data = request.get_json(silent=True) or {}
        prompt = data.get("prompt", "").strip()
        if not prompt:
            return jsonify({"message": "Prompt is required"}), 400

        t_prompt = (
            "Is the project React or Node? Determine based on the following description return in just one word nothing else: "
            f"{prompt}"
        )
        project_type = _generate_text(t_prompt).strip().lower()
        if project_type not in ("react", "node"):
            # Default to react if ambiguous
            project_type = "react"

        base_prompt = REACT_BASE_PROMPT if project_type == "react" else NODE_BASE_PROMPT

        s_prompt = (
            f"Provide the detailed structure and complete code for a {project_type} project with the complete functionality of the project asked in this prompt: {prompt}"
        )
        project_code = _generate_text(s_prompt)

        return jsonify({
            "prompts": [
                BASE_PROMPT,
                (
                    "Here is an artifact that contains all files of the project visible to you.\n"
                    "Consider the contents of ALL files in the project.\n\n"
                    f"{base_prompt}\n\n"
                    "Here is a list of files that exist on the file system but are not being shown to you:\n\n"
                    "  - .gitignore\n"
                    "  - package-lock.json\n"
                ),
            ],
            "uiPrompts": [base_prompt],
            "projectCode": project_code,
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"message": "Internal server error", "details": str(e)}), 500


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json(silent=True) or {}
        messages = data.get("messages", [])
        if not isinstance(messages, list):
            return jsonify({"message": "Messages must be an array"}), 400

        combined = "\n".join([f"{m.get('role')}: {m.get('content')}" for m in messages])
        final_prompt = f"{get_system_prompt()}\n\n{combined}"
        text = _generate_text(final_prompt)
        return jsonify({"response": text})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"message": "Internal server error", "details": str(e)}), 500


if __name__ == "__main__":
    if not (os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")):
        raise ValueError("Please set GEMINI_API_KEY or GOOGLE_API_KEY environment variable")
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))


