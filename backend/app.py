from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql
from dotenv import load_dotenv
from openai import OpenAI
import os
import json

app = Flask(__name__)
CORS(app)
load_dotenv()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)
conn = pymysql.connect(
    host=os.getenv("DB_HOST"),
    port=int(os.getenv("DB_PORT")),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME"),
    ssl={
        "ca": os.getenv("DB_SSL_CA")
    },
    cursorclass=pymysql.cursors.DictCursor
)

@app.route('/')
def home():
    return "Startup Validator API Running"

@app.route('/ideas')
def get_ideas():

    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM startup_ideas
        WHERE is_active = TRUE
    """)

    ideas = cursor.fetchall()

    return jsonify(ideas)

@app.route('/addidea', methods=['POST'])
def add_idea():

    data = request.json

    title = data['title']
    category = data['category']
    description = data['description']
    created_by = data['created_by']

    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO startup_ideas
        (title, category, description, created_by)
        VALUES (%s,%s,%s,%s)
        """,
        (title, category, description, created_by)
    )

    conn.commit()

    return jsonify({
        "message": "Idea Added Successfully"
    })

@app.route('/latestidea')
def latest_idea():

    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM startup_ideas
        ORDER BY id DESC
        LIMIT 1
    """)

    idea = cursor.fetchone()

    return jsonify(idea)

@app.route('/test-ai')
def test_ai():

    try:

        response = client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[
                {
                    "role": "user",
                    "content": "Give 3 strengths of an AI startup for students."
                }
            ]
        )

        return jsonify({
            "status": "success",
            "result": response.choices[0].message.content
        })

    except Exception as e:

        return jsonify({
            "status": "error",
            "error": str(e)
        })
@app.route('/analyze/<int:idea_id>')

def analyze_idea(idea_id):

    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM startup_ideas
        WHERE id=%s
    """, (idea_id,))

    idea = cursor.fetchone()

    if not idea:
        return jsonify({
            "error": "Idea not found"
        })

    prompt = f"""
Analyze this startup idea.

Startup Name: {idea['title']}
Category: {idea['category']}
Description: {idea['description']}

Return ONLY valid JSON in this format:

{{
    "score": 85,
    "potential": "Great Potential",
    "market_demand": 90,
    "innovation": 85,
    "scalability": 88,
    "risk_level": 70,

    "strengths": [
        "strength1",
        "strength2",
        "strength3"
    ],

    "weaknesses": [
        "weakness1",
        "weakness2"
    ],

    "opportunities": [
        "opportunity1",
        "opportunity2"
    ],

    "threats": [
        "threat1",
        "threat2"
    ],

    "recommendations": [
        "recommendation1",
        "recommendation2",
        "recommendation3"
    ]
}}

Do not return markdown.
Do not return explanation.
Return JSON only.
"""

    try:

        response = client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        ai_response = response.choices[0].message.content

        ai_response = ai_response.replace("```json", "") 
        ai_response = ai_response.replace("```", "")
        ai_response = ai_response.strip()

        analysis_data = json.loads(ai_response)
        cursor = conn.cursor()

        cursor.execute("""
    INSERT INTO startup_analysis
    (
        idea_id,
        score,
        potential,
        market_demand,
        innovation,
        scalability,
        risk_level,
        recommendations
    )
    VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
""",
(
    idea_id,
    analysis_data["score"],
    analysis_data["potential"],
    analysis_data["market_demand"],
    analysis_data["innovation"],
    analysis_data["scalability"],
    analysis_data["risk_level"],
    "\n".join(analysis_data["recommendations"])
))

        cursor.execute("""
         INSERT INTO startup_swot
        (
        idea_id,
        strengths,
        weaknesses,
        opportunities,
        threats
         )
        VALUES (%s,%s,%s,%s,%s)
        """,
        (
        idea_id,
        "\n".join(analysis_data["strengths"]),
        "\n".join(analysis_data["weaknesses"]),
        "\n".join(analysis_data["opportunities"]),
        "\n".join(analysis_data["threats"])
        ))

        conn.commit()

        return jsonify(analysis_data)

    except Exception as e:

        return jsonify({
            "status": "error",
            "error": str(e)
        })
@app.route('/analyzeidea', methods=['POST'])
def analyze_complete_idea():

    try:

        data = request.json

        title = data['title']
        category = data['category']
        description = data['description']
        created_by = data['created_by']

        cursor = conn.cursor()

        # Save Idea

        cursor.execute("""
            INSERT INTO startup_ideas
            (title, category, description, created_by)
            VALUES (%s,%s,%s,%s)
        """,
        (
            title,
            category,
            description,
            created_by
        ))

        conn.commit()

        idea_id = cursor.lastrowid

        print("IDEA ID =", idea_id)

        prompt = f"""
You are an experienced startup investor and business analyst.

Analyze the following startup idea objectively.

Startup Name: {title}
Category: {category}
Description: {description}

Evaluate based on:

1. Market Demand
2. Innovation
3. Technical Feasibility
4. Scalability
5. Business Risk
6. Overall Commercial Potential

IMPORTANT FEASIBILITY RULES:

You are acting as both a startup investor and a technical feasibility expert.

Before assigning any scores, determine whether the startup idea is:

• Technically feasible
• Scientifically possible
• Commercially viable
• Legally and ethically practical
• Achievable using current or near-future technology

If the startup idea:

- violates known laws of physics,
- requires fictional or magical technology,
- guarantees impossible medical outcomes,
- depends on technology that does not currently exist and is not realistically achievable,
- or is commercially impossible,

then:

- Reduce the Overall Score accordingly.
- Increase the Risk Level.
- Reduce Scalability if necessary.
- Explain the feasibility issues clearly in Weaknesses.
- Mention technical limitations in Threats.
- Suggest realistic alternatives or pivots in Recommendations.

Do NOT give a high Overall Score simply because an idea is creative or has high market demand.

Innovation and Market Demand may still receive high scores if appropriate, but the Overall Score must reflect the startup's real-world feasibility and business viability.

The analysis should be objective, realistic, and suitable for investors.

Also identify the TOP 3 existing competitors in the current market.

For each competitor provide:

- name
- strength
- weakness

Finally provide the startup's competitive advantages.

IMPORTANT RULES:

- Every score MUST be an integer between 0 and 100.
- Never use a 0-10 scale.

- Return EXACTLY 3 strengths.
- Return EXACTLY 3 weaknesses.
- Return EXACTLY 3 opportunities.
- Return EXACTLY 3 threats.

- Return EXACTLY 2 recommendations.
- Return EXACTLY 3 competitors.
- Return EXACTLY 2 competitive advantages.

- Return ONLY valid JSON.

Return JSON in exactly this format:

{{
     "score": 0,
    "market_demand": 0,
    "innovation": 0,
    "scalability": 0,
    "risk_level": 0,

    "strengths": [
        "",
        "",
        ""
    ],

    "weaknesses": [
        "",
        "",
        ""
    ],

    "opportunities": [
        "",
        "",
        ""
    ],

    "threats": [
        "",
        "",
        ""
    ],

    "recommendations": [
        "",
        ""
    ],

    "competitors": [
        {{
            "name": "",
            "strength": "",
            "weakness": ""
        }},
        {{
            "name": "",
            "strength": "",
            "weakness": ""
        }},
        {{
            "name": "",
            "strength": "",
            "weakness": ""
        }}
    ],

    "competitive_advantage": [
        "",
        ""
    ]
}}

Return ONLY JSON.

No markdown.

No explanation
"""
        response = client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        ai_response = response.choices[0].message.content

        print("RAW AI RESPONSE:")
        print(ai_response)

        ai_response = ai_response.replace("```json", "")
        ai_response = ai_response.replace("```", "")
        ai_response = ai_response.strip()
        try:
            analysis_data = json.loads(ai_response)
        except json.JSONDecodeError:
            return jsonify({
            "success": False,
            "error": "AI returned invalid JSON",
            "raw_response": ai_response
        }), 500
        required_fields = [
            "score",
            "market_demand",
            "innovation",
            "scalability",
            "risk_level",
            "strengths",
            "weaknesses",
            "opportunities",
            "threats",
            "recommendations",
            "competitors",
            "competitive_advantage"
            ]

        missing = [
            field
            for field in required_fields
            if field not in analysis_data
        ]

        if missing:
            return jsonify({
            "success": False,
            "error": f"AI response missing fields: {missing}"
        }), 500
        # -----------------------------
# Limit AI Output
# -----------------------------

        analysis_data["strengths"] = analysis_data.get("strengths", [])[:3]
        analysis_data["weaknesses"] = analysis_data.get("weaknesses", [])[:3]
        analysis_data["opportunities"] = analysis_data.get("opportunities", [])[:3]
        analysis_data["threats"] = analysis_data.get("threats", [])[:3]

        analysis_data["recommendations"] = analysis_data.get("recommendations", [])[:2]

        analysis_data["competitors"] = analysis_data.get("competitors", [])[:3]

        analysis_data["competitive_advantage"] = analysis_data.get("competitive_advantage", [])[:2]

       
        score_fields = [
            "score",
            "market_demand",
            "innovation",
            "scalability",
            "risk_level"
        ]

        for field in score_fields:

            value = analysis_data[field]

            if isinstance(value, (int, float)):

                if 0 < value < 10:
                    value *= 10

                value = int(round(value))
                value = max(0, min(100, value))

            else:
                value = 0

            analysis_data[field] = value

        # -----------------------------
        # Calculate Potential
        # -----------------------------

        score = analysis_data.get("score", 0)

        if score >= 90:
            potential = "Excellent Potential"

        elif score >= 80:
            potential = "Great Potential"

        elif score >= 70:
            potential = "Good Potential"

        elif score >= 60:
            potential = "Moderate Potential"

        elif score >= 40:
            potential = "Needs Improvement"

        else:
            potential = "High Risk"

        analysis_data["potential"] = potential

        print("PARSED JSON:")
        print(analysis_data)

        # Save Analysis
        cursor.execute("""
            INSERT INTO startup_analysis
            (
                 idea_id,
                 score,
                 potential,
                 market_demand,
                 innovation,
                 scalability,
                 risk_level,
                 recommendations,
                 competitors,
                 competitive_advantage
            )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """,
        (
            idea_id,
            analysis_data["score"],
            analysis_data["potential"],
            analysis_data["market_demand"],
            analysis_data["innovation"],
            analysis_data["scalability"],
            analysis_data["risk_level"],

            "\n".join(analysis_data["recommendations"]),

            json.dumps(
            analysis_data["competitors"],
            indent=2
            ),

            "\n".join(
            analysis_data["competitive_advantage"]
            )
    ))
        # Save SWOT

        cursor.execute("""
            INSERT INTO startup_swot
            (
                idea_id,
                strengths,
                weaknesses,
                opportunities,
                threats
            )
            VALUES (%s,%s,%s,%s,%s)
            """,
        (
            idea_id,
          "\n".join(analysis_data["strengths"]),
          "\n".join(analysis_data["weaknesses"]),
          "\n".join(analysis_data["opportunities"]),
          "\n".join(analysis_data["threats"])
        ))

        conn.commit()

        print("ANALYSIS SAVED SUCCESSFULLY")

        return jsonify({
            "success": True,
            "idea_id": idea_id,
            "analysis": analysis_data
        })

    except Exception as e:

        print("ERROR =", str(e))

        return jsonify({
                "success": False,
                "error": str(e)
        }), 500

@app.route('/latestreport')
def latest_report():

    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM startup_ideas
        ORDER BY id DESC
        LIMIT 1
    """)
    idea = cursor.fetchone()

    cursor.execute("""
        SELECT *
        FROM startup_analysis
        WHERE idea_id=%s
        ORDER BY id DESC
        LIMIT 1
    """, (idea["id"],))
    analysis = cursor.fetchone()

    cursor.execute("""
        SELECT *
        FROM startup_swot
        WHERE idea_id=%s
        ORDER BY id DESC
        LIMIT 1
    """, (idea["id"],))
    swot = cursor.fetchone()

    return jsonify({
        "idea": idea,
        "analysis": analysis,
        "swot": swot
    })
@app.route('/dashboard')
def dashboard():

    cursor = conn.cursor()

    cursor.execute("""
        SELECT COUNT(*) AS total_ideas
        FROM startup_ideas
    """)
    total = cursor.fetchone()

    cursor.execute("""
        SELECT ROUND(AVG(score)) AS avg_score
        FROM startup_analysis
    """)
    avg_score = cursor.fetchone()

    cursor.execute("""
        SELECT MAX(score) AS highest_score
        FROM startup_analysis
    """)
    highest = cursor.fetchone()

    cursor.execute("""
        SELECT
            s.id,
            s.title,
            s.category,
            a.score
        FROM startup_ideas s
        JOIN startup_analysis a
        ON s.id = a.idea_id
        ORDER BY s.id DESC
        LIMIT 3
    """)
    recent = cursor.fetchall()

    return jsonify({
        "total_ideas": total["total_ideas"],
        "average_score": avg_score["avg_score"],
        "highest_score": highest["highest_score"],
        "recent_analyses": recent
    })
@app.route("/report/<int:idea_id>")
def report(idea_id):

    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM startup_ideas
        WHERE id=%s
    """, (idea_id,))
    idea = cursor.fetchone()

    cursor.execute("""
        SELECT *
        FROM startup_analysis
        WHERE idea_id=%s
        ORDER BY id DESC
        LIMIT 1
    """, (idea_id,))
    analysis = cursor.fetchone()

    cursor.execute("""
        SELECT *
        FROM startup_swot
        WHERE idea_id=%s
        ORDER BY id DESC
        LIMIT 1
    """, (idea_id,))
    swot = cursor.fetchone()

    if not idea or not analysis or not swot:
        return jsonify({"error": "Report not found"}), 404

    return jsonify({
        "idea": idea,
        "analysis": analysis,
        "swot": swot
    })
@app.route('/recent-validations')
def recent_validations():

    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            s.id,
            s.title,
            s.category,
            s.description,
            a.score
        FROM startup_ideas s
        JOIN startup_analysis a
        ON s.id = a.idea_id
        ORDER BY s.id DESC
        LIMIT 3
    """)

    ideas = cursor.fetchall()

    return jsonify(ideas)
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)