import os

OUTPUT_DIR = "/Users/akashstephen/Developer/Pediatrics Exam"

with open(os.path.join(OUTPUT_DIR, "worker", "index.html"), "r", encoding="utf-8") as f:
    html = f.read()

# Escape backticks and dollars for template literal
html_escaped = html.replace("\\", "\\\\").replace("`", "\\`").replace("$", "\\$")

worker_script = f"""export default {{
  async fetch(request, env, ctx) {{
    return new Response(`{html_escaped}`, {{
      headers: {{
        'content-type': 'text/html;charset=UTF-8',
        'cache-control': 'public, max-age=3600',
      }},
    }});
  }},
}};
"""

with open(os.path.join(OUTPUT_DIR, "worker", "src", "index.js"), "w", encoding="utf-8") as f:
    f.write(worker_script)

print(f"Worker script generated: {len(worker_script)} bytes")
print(f"HTML embedded: {len(html)} bytes")
