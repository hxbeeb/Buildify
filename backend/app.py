from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
import google.generativeai as genai
import os
from typing import Iterator
import traceback

# Add dotenv support
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000","https://buildify-ts.onrender.com"]}})

# Configure Google Gemini API
# Make sure to set your API key in environment variables
print()
API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
genai.configure(api_key=API_KEY)

# Initialize the model
model = genai.GenerativeModel('gemini-2.0-flash')

def stream_response(response) -> Iterator[str]:
    for chunk in response:
        if chunk.text:
            yield chunk.text

@app.route("/generate", methods=["POST"])
def generate():
    try:
        data = request.get_json()
        prompt = data.get("prompt")
        
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
            
        # Generate a single response
        response = model.generate_content(prompt)
        return jsonify({"response": response.text})
        
    except Exception as e:
        print("Exception in /generate endpoint:", e)
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/stream", methods=["POST"])
def stream():
    try:
        data = request.get_json()
        prompt = data.get("prompt")
        
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
            
        # Generate streaming response
        response = model.generate_content(prompt, stream=True)
        
        return Response(
            stream_with_context(stream_response(response)),
            content_type='text/event-stream'
        )
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        messages = data.get("messages", [])
        stream_mode = data.get("stream", False)
        
        if not messages:
            return jsonify({"error": "Messages are required"}), 400
            
        # Initialize chat
        chat = model.start_chat(history=[])
        
        # Add messages to chat
        for msg in messages:
            if msg["role"] == "user":
                response = chat.send_message(msg["content"], stream=stream_mode)
                
        if stream_mode:
            return Response(
                stream_with_context(stream_response(response)),
                content_type='text/event-stream'
            )
        else:
            return jsonify({"response": response.text})
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    if not API_KEY:
        raise ValueError("Please set GEMINI_API_KEY or GOOGLE_API_KEY environment variable")
    app.run(host="0.0.0.0",port=5000)