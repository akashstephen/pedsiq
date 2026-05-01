import json
import os

OUTPUT_DIR = "/Users/akashstephen/Developer/Pediatrics Exam"

# Load all classified batches
all_q = []
for i in range(1,5):
    with open(os.path.join(OUTPUT_DIR, f"classified_batch_{i}.json"), 'r', encoding='utf-8') as f:
        all_q.extend(json.load(f))

# Standardize formats
for q in all_q:
    sec = q.get('nelson_section', 'Uncategorized')
    if sec.startswith('SECTION '):
        parts = sec.split(': ', 1)
        if len(parts) == 2:
            sec_num = parts[0].replace('SECTION ', '')
            sec_name = parts[1]
            q['nelson_section'] = f"{sec_num}. {sec_name}"
    
    ch = q.get('nelson_chapter', 'Uncategorized')
    if ch.startswith('Ch') and ':' in ch:
        parts = ch.split(':', 1)
        if len(parts) == 2:
            ch_num = parts[0].replace('Ch', '')
            ch_name = parts[1].strip()
            q['nelson_chapter'] = f"{ch_num}. {ch_name}"

# Embed data as JSON string
questions_json = json.dumps(all_q, ensure_ascii=False)

html_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pediatrics Exam Intelligence Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3.0.0/dist/chartjs-adapter-date-fns.bundle.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        :root {{
            --bg: #000000;
            --surface: #0a0a0a;
            --surface-elevated: #111111;
            --surface-hover: #1a1a1a;
            --text-primary: #ffffff;
            --text-secondary: rgba(255,255,255,0.6);
            --text-tertiary: rgba(255,255,255,0.35);
            --accent: #007AFF;
            --accent-glow: rgba(0,122,255,0.3);
            --accent-secondary: #5856D6;
            --success: #34C759;
            --warning: #FF9500;
            --danger: #FF3B30;
            --gradient-1: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
            --gradient-2: linear-gradient(135deg, #FF2D55 0%, #FF9500 100%);
            --gradient-3: linear-gradient(135deg, #34C759 0%, #00C7BE 100%);
            --glass: rgba(255,255,255,0.03);
            --glass-border: rgba(255,255,255,0.08);
        }}
        
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
            background: var(--bg);
            color: var(--text-primary);
            min-height: 100vh;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
        }}
        
        /* Animated background */
        .bg-mesh {{
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
            opacity: 0.4;
        }}
        
        .bg-mesh::before {{
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: 
                radial-gradient(ellipse 80% 50% at 20% 40%, rgba(0,122,255,0.08) 0%, transparent 50%),
                radial-gradient(ellipse 60% 40% at 80% 20%, rgba(88,86,214,0.06) 0%, transparent 50%),
                radial-gradient(ellipse 50% 60% at 60% 80%, rgba(255,45,85,0.05) 0%, transparent 50%);
            animation: meshFloat 20s ease-in-out infinite;
        }}
        
        @keyframes meshFloat {{
            0%, 100% {{ transform: translate(0, 0) rotate(0deg); }}
            33% {{ transform: translate(-2%, 2%) rotate(1deg); }}
            66% {{ transform: translate(2%, -1%) rotate(-1deg); }}
        }}
        
        /* Noise texture overlay */
        .noise {{
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            opacity: 0.025;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }}
        
        /* Layout */
        .app {{
            position: relative;
            z-index: 2;
            display: flex;
            min-height: 100vh;
        }}
        
        /* Sidebar */
        .sidebar {{
            width: 260px;
            background: var(--surface);
            border-right: 1px solid var(--glass-border);
            padding: 24px 16px;
            display: flex;
            flex-direction: column;
            position: fixed;
            height: 100vh;
            overflow-y: auto;
            z-index: 100;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }}
        
        .sidebar::-webkit-scrollbar {{
            width: 4px;
        }}
        
        .sidebar::-webkit-scrollbar-thumb {{
            background: var(--glass-border);
            border-radius: 4px;
        }}
        
        .logo {{
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0 12px 24px;
            border-bottom: 1px solid var(--glass-border);
            margin-bottom: 16px;
        }}
        
        .logo-icon {{
            width: 40px;
            height: 40px;
            background: var(--gradient-1);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: 700;
            box-shadow: 0 4px 20px var(--accent-glow);
        }}
        
        .logo-text {{
            font-size: 18px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }}
        
        .logo-sub {{
            font-size: 11px;
            color: var(--text-tertiary);
            font-weight: 500;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }}
        
        .nav {{
            display: flex;
            flex-direction: column;
            gap: 4px;
        }}
        
        .nav-item {{
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 12px;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 14px;
            font-weight: 500;
            color: var(--text-secondary);
            border: none;
            background: none;
            width: 100%;
            text-align: left;
            font-family: inherit;
        }}
        
        .nav-item:hover {{
            background: var(--glass);
            color: var(--text-primary);
        }}
        
        .nav-item.active {{
            background: var(--glass);
            color: var(--text-primary);
            box-shadow: inset 0 0 0 1px var(--glass-border);
        }}
        
        .nav-item .nav-icon {{
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
        }}
        
        .nav-badge {{
            margin-left: auto;
            background: var(--accent);
            color: white;
            font-size: 10px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 10px;
        }}
        
        /* Main content */
        .main {{
            flex: 1;
            margin-left: 260px;
            padding: 32px 40px;
            max-width: calc(100% - 260px);
        }}
        
        .page {{
            display: none;
            animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }}
        
        .page.active {{
            display: block;
        }}
        
        @keyframes fadeIn {{
            from {{ opacity: 0; transform: translateY(12px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}
        
        /* Header */
        .page-header {{
            margin-bottom: 32px;
        }}
        
        .page-title {{
            font-size: 32px;
            font-weight: 800;
            letter-spacing: -1px;
            margin-bottom: 8px;
            background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }}
        
        .page-subtitle {{
            font-size: 15px;
            color: var(--text-secondary);
            font-weight: 400;
        }}
        
        /* Cards */
        .card-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 32px;
        }}
        
        .card {{
            background: var(--surface-elevated);
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            padding: 24px;
            position: relative;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }}
        
        .card:hover {{
            border-color: rgba(255,255,255,0.15);
            transform: translateY(-2px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }}
        
        .card::before {{
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        }}
        
        .card-glow {{
            position: absolute;
            top: -50%;
            right: -50%;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        }}
        
        .card:hover .card-glow {{
            opacity: 0.05;
        }}
        
        .card-glow.blue {{ background: var(--accent); }}
        .card-glow.purple {{ background: var(--accent-secondary); }}
        .card-glow.green {{ background: var(--success); }}
        .card-glow.orange {{ background: var(--warning); }}
        .card-glow.red {{ background: var(--danger); }}
        
        .card-label {{
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: var(--text-tertiary);
            margin-bottom: 8px;
        }}
        
        .card-value {{
            font-size: 42px;
            font-weight: 800;
            letter-spacing: -2px;
            margin-bottom: 4px;
        }}
        
        .card-value.gradient-blue {{
            background: var(--gradient-1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }}
        
        .card-value.gradient-purple {{
            background: linear-gradient(135deg, #5856D6 0%, #AF52DE 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }}
        
        .card-value.gradient-green {{
            background: var(--gradient-3);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }}
        
        .card-value.gradient-orange {{
            background: var(--gradient-2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }}
        
        .card-delta {{
            font-size: 13px;
            font-weight: 500;
            color: var(--success);
        }}
        
        .card-delta.negative {{
            color: var(--danger);
        }}
        
        /* Section headers */
        .section-header {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
            margin-top: 40px;
        }}
        
        .section-title {{
            font-size: 20px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }}
        
        .section-action {{
            font-size: 13px;
            color: var(--accent);
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s;
        }}
        
        .section-action:hover {{
            opacity: 0.7;
        }}
        
        /* Chart containers */
        .chart-card {{
            background: var(--surface-elevated);
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            padding: 24px;
            margin-bottom: 20px;
        }}
        
        .chart-title {{
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
            color: var(--text-primary);
        }}
        
        .chart-container {{
            position: relative;
            height: 300px;
        }}
        
        .chart-row {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
        }}
        
        /* Table */
        .table-card {{
            background: var(--surface-elevated);
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            overflow: hidden;
        }}
        
        .table-header {{
            display: grid;
            grid-template-columns: 60px 1fr 120px 80px 100px;
            padding: 14px 20px;
            background: var(--glass);
            border-bottom: 1px solid var(--glass-border);
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-tertiary);
        }}
        
        .table-row {{
            display: grid;
            grid-template-columns: 60px 1fr 120px 80px 100px;
            padding: 14px 20px;
            border-bottom: 1px solid var(--glass-border);
            font-size: 14px;
            transition: background 0.15s;
            cursor: pointer;
        }}
        
        .table-row:hover {{
            background: var(--glass);
        }}
        
        .table-row:last-child {{
            border-bottom: none;
        }}
        
        .table-cell {{
            display: flex;
            align-items: center;
        }}
        
        .rank-badge {{
            width: 28px;
            height: 28px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 700;
            background: var(--glass);
            color: var(--text-secondary);
        }}
        
        .rank-badge.top {{
            background: var(--gradient-1);
            color: white;
        }}
        
        .topic-name {{
            font-weight: 600;
            color: var(--text-primary);
        }}
        
        .topic-meta {{
            font-size: 12px;
            color: var(--text-tertiary);
            margin-top: 2px;
        }}
        
        .count-pill {{
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: var(--glass);
            padding: 4px 10px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
        }}
        
        .marks-pill {{
            display: inline-flex;
            align-items: center;
            background: rgba(0,122,255,0.1);
            color: var(--accent);
            padding: 4px 10px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
        }}
        
        /* Question cards */
        .question-list {{
            display: flex;
            flex-direction: column;
            gap: 12px;
        }}
        
        .question-card {{
            background: var(--surface-elevated);
            border: 1px solid var(--glass-border);
            border-radius: 16px;
            padding: 20px;
            transition: all 0.2s ease;
            cursor: pointer;
        }}
        
        .question-card:hover {{
            border-color: rgba(255,255,255,0.15);
            transform: translateX(4px);
        }}
        
        .question-header {{
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
        }}
        
        .question-year {{
            font-size: 12px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 6px;
            background: var(--glass);
            color: var(--text-secondary);
        }}
        
        .question-section {{
            font-size: 12px;
            font-weight: 600;
            color: var(--accent);
        }}
        
        .question-marks {{
            margin-left: auto;
            font-size: 13px;
            font-weight: 700;
            color: var(--warning);
        }}
        
        .question-text {{
            font-size: 15px;
            line-height: 1.5;
            color: var(--text-primary);
            font-weight: 500;
        }}
        
        .question-chapter {{
            font-size: 12px;
            color: var(--text-tertiary);
            margin-top: 8px;
            display: flex;
            align-items: center;
            gap: 6px;
        }}
        
        .question-chapter::before {{
            content: '';
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: var(--accent);
        }}
        
        /* Filter bar */
        .filter-bar {{
            display: flex;
            gap: 8px;
            margin-bottom: 24px;
            flex-wrap: wrap;
        }}
        
        .filter-chip {{
            padding: 8px 16px;
            border-radius: 10px;
            border: 1px solid var(--glass-border);
            background: var(--surface-elevated);
            color: var(--text-secondary);
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
        }}
        
        .filter-chip:hover {{
            border-color: rgba(255,255,255,0.2);
            color: var(--text-primary);
        }}
        
        .filter-chip.active {{
            background: var(--accent);
            color: white;
            border-color: var(--accent);
            box-shadow: 0 4px 20px var(--accent-glow);
        }}
        
        /* Prediction cards */
        .prediction-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }}
        
        .prediction-card {{
            background: var(--surface-elevated);
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            padding: 24px;
            position: relative;
            overflow: hidden;
        }}
        
        .prediction-card::after {{
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
        }}
        
        .prediction-card.hot::after {{
            background: var(--gradient-2);
        }}
        
        .prediction-card.warm::after {{
            background: var(--gradient-3);
        }}
        
        .prediction-card.cool::after {{
            background: var(--gradient-1);
        }}
        
        .prediction-badge {{
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 4px 10px;
            border-radius: 8px;
            margin-bottom: 12px;
        }}
        
        .prediction-badge.hot {{
            background: rgba(255,45,85,0.1);
            color: #FF2D55;
        }}
        
        .prediction-badge.warm {{
            background: rgba(255,149,0,0.1);
            color: #FF9500;
        }}
        
        .prediction-badge.cool {{
            background: rgba(0,122,255,0.1);
            color: #007AFF;
        }}
        
        .prediction-title {{
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 8px;
        }}
        
        .prediction-desc {{
            font-size: 14px;
            color: var(--text-secondary);
            line-height: 1.5;
            margin-bottom: 12px;
        }}
        
        .prediction-prob {{
            font-size: 13px;
            font-weight: 600;
            color: var(--text-tertiary);
        }}
        
        /* Mobile sidebar toggle */
        .sidebar-toggle {{
            display: none;
            position: fixed;
            top: 16px;
            left: 16px;
            z-index: 200;
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: var(--surface);
            border: 1px solid var(--glass-border);
            color: white;
            font-size: 20px;
            cursor: pointer;
            align-items: center;
            justify-content: center;
        }}
        
        @media (max-width: 768px) {{
            .sidebar {{
                transform: translateX(-100%);
            }}
            .sidebar.open {{
                transform: translateX(0);
            }}
            .main {{
                margin-left: 0;
                max-width: 100%;
                padding: 20px;
                padding-top: 72px;
            }}
            .sidebar-toggle {{
                display: flex;
            }}
            .card-grid {{
                grid-template-columns: 1fr;
            }}
            .chart-row {{
                grid-template-columns: 1fr;
            }}
            .table-header,
            .table-row {{
                grid-template-columns: 40px 1fr 80px;
            }}
            .table-cell:nth-child(4),
            .table-cell:nth-child(5) {{
                display: none;
            }}
        }}
        
        /* Scrollbar */
        ::-webkit-scrollbar {{
            width: 6px;
        }}
        
        ::-webkit-scrollbar-track {{
            background: transparent;
        }}
        
        ::-webkit-scrollbar-thumb {{
            background: rgba(255,255,255,0.1);
            border-radius: 6px;
        }}
        
        ::-webkit-scrollbar-thumb:hover {{
            background: rgba(255,255,255,0.2);
        }}
        
        /* Loading animation */
        .loading {{
            display: flex;
            align-items: center;
            justify-content: center;
            height: 200px;
            color: var(--text-tertiary);
        }}
        
        .spinner {{
            width: 32px;
            height: 32px;
            border: 2px solid var(--glass-border);
            border-top-color: var(--accent);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-right: 12px;
        }}
        
        @keyframes spin {{
            to {{ transform: rotate(360deg); }}
        }}
    </style>
</head>
<body>
    <div class="bg-mesh"></div>
    <div class="noise"></div>
    
    <button class="sidebar-toggle" onclick="toggleSidebar()">☰</button>
    
    <div class="app">
        <aside class="sidebar" id="sidebar">
            <div class="logo">
                <div class="logo-icon">P</div>
                <div>
                    <div class="logo-text">PedsIQ</div>
                    <div class="logo-sub">KUHS PYQ Analyzer</div>
                </div>
            </div>
            
            <nav class="nav">
                <button class="nav-item active" onclick="showPage('overview')" data-page="overview">
                    <span class="nav-icon">◈</span>
                    <span>Overview</span>
                </button>
                <button class="nav-item" onclick="showPage('questions')" data-page="questions">
                    <span class="nav-icon">◫</span>
                    <span>All Questions</span>
                    <span class="nav-badge" id="nav-q-count">411</span>
                </button>
                <button class="nav-item" onclick="showPage('nelson')" data-page="nelson">
                    <span class="nav-icon">◐</span>
                    <span>Nelson Chapters</span>
                </button>
                <button class="nav-item" onclick="showPage('subjects')" data-page="subjects">
                    <span class="nav-icon">◑</span>
                    <span>Subject Analysis</span>
                </button>
                <button class="nav-item" onclick="showPage('predictions')" data-page="predictions">
                    <span class="nav-icon">◉</span>
                    <span>Predictions</span>
                </button>
                <button class="nav-item" onclick="showPage('heatmap')" data-page="heatmap">
                    <span class="nav-icon">▣</span>
                    <span>Year Heatmap</span>
                </button>
            </nav>
        </aside>
        
        <main class="main">
            <!-- OVERVIEW PAGE -->
            <div class="page active" id="page-overview">
                <div class="page-header">
                    <h1 class="page-title">Dashboard Overview</h1>
                    <p class="page-subtitle">KUHS Pediatrics Previous Year Questions (2015–2025)</p>
                </div>
                
                <div class="card-grid">
                    <div class="card">
                        <div class="card-glow blue"></div>
                        <div class="card-label">Total Questions</div>
                        <div class="card-value gradient-blue" id="stat-total">0</div>
                        <div class="card-delta">from 24 exam papers</div>
                    </div>
                    <div class="card">
                        <div class="card-glow purple"></div>
                        <div class="card-label">Total Marks</div>
                        <div class="card-value gradient-purple" id="stat-marks">0</div>
                        <div class="card-delta">across all papers</div>
                    </div>
                    <div class="card">
                        <div class="card-glow green"></div>
                        <div class="card-label">Papers Analyzed</div>
                        <div class="card-value gradient-green" id="stat-papers">24</div>
                        <div class="card-delta">2015 to 2025</div>
                    </div>
                    <div class="card">
                        <div class="card-glow orange"></div>
                        <div class="card-label">Nelson Sections</div>
                        <div class="card-value gradient-orange" id="stat-sections">0</div>
                        <div class="card-delta">covered in syllabus</div>
                    </div>
                </div>
                
                <div class="section-header">
                    <h2 class="section-title">Question Distribution by Year</h2>
                </div>
                <div class="chart-card">
                    <div class="chart-container">
                        <canvas id="chart-yearly"></canvas>
                    </div>
                </div>
                
                <div class="section-header">
                    <h2 class="section-title">Top Nelson Sections</h2>
                </div>
                <div class="chart-card">
                    <div class="chart-container">
                        <canvas id="chart-sections"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- ALL QUESTIONS PAGE -->
            <div class="page" id="page-questions">
                <div class="page-header">
                    <h1 class="page-title">All Questions</h1>
                    <p class="page-subtitle">Browse and filter 411 extracted questions</p>
                </div>
                
                <div class="filter-bar" id="question-filters">
                    <button class="filter-chip active" onclick="filterQuestions('all')">All</button>
                    <button class="filter-chip" onclick="filterQuestions('2010')">2010 Scheme</button>
                    <button class="filter-chip" onclick="filterQuestions('2019')">2019 Scheme</button>
                    <button class="filter-chip" onclick="filterQuestions('Essay')">Essays</button>
                    <button class="filter-chip" onclick="filterQuestions('Short')">Short Notes</button>
                    <button class="filter-chip" onclick="filterQuestions('MCQ')">MCQs</button>
                </div>
                
                <div class="question-list" id="question-list">
                    <div class="loading"><div class="spinner"></div>Loading questions...</div>
                </div>
            </div>
            
            <!-- NELSON CHAPTERS PAGE -->
            <div class="page" id="page-nelson">
                <div class="page-header">
                    <h1 class="page-title">Nelson Chapters</h1>
                    <p class="page-subtitle">Questions mapped to Nelson Essentials of Pediatrics, 8th Ed</p>
                </div>
                
                <div class="chart-row">
                    <div class="chart-card">
                        <div class="chart-title">Questions per Section</div>
                        <div class="chart-container">
                            <canvas id="chart-nelson-sections"></canvas>
                        </div>
                    </div>
                    <div class="chart-card">
                        <div class="chart-title">Marks per Section</div>
                        <div class="chart-container">
                            <canvas id="chart-nelson-marks"></canvas>
                        </div>
                    </div>
                </div>
                
                <div class="section-header">
                    <h2 class="section-title">Top 20 Nelson Chapters</h2>
                </div>
                <div class="table-card" id="nelson-table">
                    <div class="loading"><div class="spinner"></div>Loading...</div>
                </div>
            </div>
            
            <!-- SUBJECT ANALYSIS PAGE -->
            <div class="page" id="page-subjects">
                <div class="page-header">
                    <h1 class="page-title">Subject Analysis</h1>
                    <p class="page-subtitle">Deep dive into GI/Hepatology, Nephrology, and Endocrinology</p>
                </div>
                
                <div class="chart-row">
                    <div class="chart-card">
                        <div class="chart-title">Subject Distribution</div>
                        <div class="chart-container">
                            <canvas id="chart-subject-pie"></canvas>
                        </div>
                    </div>
                    <div class="chart-card">
                        <div class="chart-title">Cognitive Level Distribution</div>
                        <div class="chart-container">
                            <canvas id="chart-cognitive"></canvas>
                        </div>
                    </div>
                </div>
                
                <div class="section-header">
                    <h2 class="section-title">High-Yield Subtopics</h2>
                </div>
                <div class="table-card" id="subject-table">
                    <div class="loading"><div class="spinner"></div>Loading...</div>
                </div>
            </div>
            
            <!-- PREDICTIONS PAGE -->
            <div class="page" id="page-predictions">
                <div class="page-header">
                    <h1 class="page-title">Exam Predictions</h1>
                    <p class="page-subtitle">AI-powered topic forecasting for next exam</p>
                </div>
                
                <div class="prediction-grid" id="prediction-grid">
                    <!-- Filled by JS -->
                </div>
            </div>
            
            <!-- HEATMAP PAGE -->
            <div class="page" id="page-heatmap">
                <div class="page-header">
                    <h1 class="page-title">Year vs Topic Heatmap</h1>
                    <p class="page-subtitle">Visualizing topic trends across examination years</p>
                </div>
                
                <div class="chart-card">
                    <div class="chart-title">Topic Frequency by Year</div>
                    <div class="chart-container" style="height: 400px;">
                        <canvas id="chart-heatmap"></canvas>
                    </div>
                </div>
            </div>
        </main>
    </div>
    
    <script>
        const QUESTIONS = {questions_json};
        
        // Navigation
        function showPage(pageId) {{
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            document.getElementById('page-' + pageId).classList.add('active');
            document.querySelector('[data-page="' + pageId + '"]').classList.add('active');
            
            if (pageId === 'questions') renderQuestions();
            if (pageId === 'nelson') renderNelson();
            if (pageId === 'subjects') renderSubjects();
            if (pageId === 'predictions') renderPredictions();
            if (pageId === 'heatmap') renderHeatmap();
        }}
        
        function toggleSidebar() {{
            document.getElementById('sidebar').classList.toggle('open');
        }}
        
        // Data processing
        function processData() {{
            const years = {{}};
            const sections = {{}};
            const chapters = {{}};
            const schemes = {{ '2010': 0, '2019': 0 }};
            let totalMarks = 0;
            
            QUESTIONS.forEach(q => {{
                const year = q.exam_year || 'Unknown';
                const section = q.nelson_section || 'Uncategorized';
                const chapter = q.nelson_chapter || 'Uncategorized';
                const marks = parseFloat(q.marks) || 0;
                const scheme = q.scheme || '2010';
                
                years[year] = (years[year] || 0) + 1;
                sections[section] = (sections[section] || 0) + 1;
                chapters[chapter] = (chapters[chapter] || {{ count: 0, marks: 0 }});
                chapters[chapter].count += 1;
                chapters[chapter].marks += marks;
                
                schemes[scheme] = (schemes[scheme] || 0) + 1;
                totalMarks += marks;
            }});
            
            return {{ years, sections, chapters, schemes, totalMarks }};
        }}
        
        const data = processData();
        
        // Update overview stats
        document.getElementById('stat-total').textContent = QUESTIONS.length;
        document.getElementById('stat-marks').textContent = Math.round(data.totalMarks);
        document.getElementById('stat-sections').textContent = Object.keys(data.sections).length;
        
        // Chart.js defaults
        Chart.defaults.color = 'rgba(255,255,255,0.6)';
        Chart.defaults.borderColor = 'rgba(255,255,255,0.08)';
        Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
        
        // Yearly chart
        const yearLabels = Object.keys(data.years).sort();
        const yearValues = yearLabels.map(y => data.years[y]);
        new Chart(document.getElementById('chart-yearly'), {{
            type: 'line',
            data: {{
                labels: yearLabels,
                datasets: [{{
                    label: 'Questions',
                    data: yearValues,
                    borderColor: '#007AFF',
                    backgroundColor: 'rgba(0,122,255,0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: '#007AFF',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                }}]
            }},
            options: {{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {{
                    legend: {{ display: false }}
                }},
                scales: {{
                    y: {{
                        beginAtZero: true,
                        grid: {{ color: 'rgba(255,255,255,0.05)' }}
                    }},
                    x: {{
                        grid: {{ display: false }}
                    }}
                }}
            }}
        }});
        
        // Top sections bar chart
        const sortedSections = Object.entries(data.sections)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        new Chart(document.getElementById('chart-sections'), {{
            type: 'bar',
            data: {{
                labels: sortedSections.map(s => s[0].replace(/^\\d+\\.\\s*/, '')),
                datasets: [{{
                    label: 'Questions',
                    data: sortedSections.map(s => s[1]),
                    backgroundColor: sortedSections.map((_, i) => {{
                        const colors = ['#007AFF', '#5856D6', '#AF52DE', '#FF2D55', '#FF9500', '#FFCC00', '#34C759', '#00C7BE', '#5AC8FA', '#64D2FF'];
                        return colors[i] + 'CC';
                    }}),
                    borderRadius: 8,
                    borderSkipped: false,
                }}]
            }},
            options: {{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {{ legend: {{ display: false }} }},
                scales: {{
                    y: {{ beginAtZero: true, grid: {{ color: 'rgba(255,255,255,0.05)' }} }},
                    x: {{ grid: {{ display: false }} }}
                }}
            }}
        }});
        
        // Questions page
        let currentFilter = 'all';
        function renderQuestions() {{
            const list = document.getElementById('question-list');
            let filtered = QUESTIONS;
            
            if (currentFilter === '2010') filtered = QUESTIONS.filter(q => q.scheme === '2010');
            else if (currentFilter === '2019') filtered = QUESTIONS.filter(q => q.scheme === '2019');
            else if (currentFilter === 'Essay') filtered = QUESTIONS.filter(q => q.section === 'Essay' || q.section === 'Long Essays');
            else if (currentFilter === 'Short') filtered = QUESTIONS.filter(q => q.section.includes('Short'));
            else if (currentFilter === 'MCQ') filtered = QUESTIONS.filter(q => q.section === 'MCQs');
            
            list.innerHTML = filtered.slice(0, 50).map(q => `
                <div class="question-card">
                    <div class="question-header">
                        <span class="question-year">${{q.exam_year}} ${{q.exam_month}}</span>
                        <span class="question-section">${{q.section}}</span>
                        <span class="question-marks">${{q.marks}} marks</span>
                    </div>
                    <div class="question-text">${{q.question_text}}</div>
                    <div class="question-chapter">${{q.nelson_chapter || 'Uncategorized'}}</div>
                </div>
            `).join('');
            
            if (filtered.length > 50) {{
                list.innerHTML += `<div style="text-align:center;padding:20px;color:var(--text-tertiary);">Showing 50 of ${{filtered.length}} questions</div>`;
            }}
        }}
        
        function filterQuestions(filter) {{
            currentFilter = filter;
            document.querySelectorAll('#question-filters .filter-chip').forEach(c => c.classList.remove('active'));
            event.target.classList.add('active');
            renderQuestions();
        }}
        
        // Nelson page
        function renderNelson() {{
            const sortedChapters = Object.entries(data.chapters)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 20);
            
            document.getElementById('nelson-table').innerHTML = `
                <div class="table-header">
                    <div>Rank</div>
                    <div>Chapter</div>
                    <div>Questions</div>
                    <div>Marks</div>
                    <div>Section</div>
                </div>
                ${{sortedChapters.map(([chapter, info], i) => `
                    <div class="table-row">
                        <div class="table-cell"><span class="rank-badge ${{i < 3 ? 'top' : ''}}">${{i + 1}}</span></div>
                        <div class="table-cell">
                            <div>
                                <div class="topic-name">${{chapter.replace(/^\\d+\\.\\s*/, '')}}</div>
                            </div>
                        </div>
                        <div class="table-cell"><span class="count-pill">${{info.count}}</span></div>
                        <div class="table-cell"><span class="marks-pill">${{Math.round(info.marks)}}</span></div>
                        <div class="table-cell" style="color:var(--text-tertiary);font-size:12px;">${{chapter.split('.')[0]}}</div>
                    </div>
                `).join('')}}
            `;
            
            // Nelson sections chart
            const sectionEntries = Object.entries(data.sections).sort((a, b) => b[1] - a[1]);
            new Chart(document.getElementById('chart-nelson-sections'), {{
                type: 'doughnut',
                data: {{
                    labels: sectionEntries.map(s => s[0].replace(/^\\d+\\.\\s*/, '').substring(0, 20)),
                    datasets: [{{
                        data: sectionEntries.map(s => s[1]),
                        backgroundColor: sectionEntries.map((_, i) => {{
                            const colors = ['#007AFF', '#5856D6', '#AF52DE', '#FF2D55', '#FF9500', '#34C759', '#00C7BE', '#5AC8FA', '#64D2FF', '#BF5AF2'];
                            return colors[i % colors.length] + 'DD';
                        }}),
                        borderWidth: 0,
                    }}]
                }},
                options: {{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {{
                        legend: {{ position: 'right', labels: {{ boxWidth: 12, padding: 10 }} }}
                    }}
                }}
            }});
            
            // Nelson marks chart
            const sectionMarks = {{}};
            QUESTIONS.forEach(q => {{
                const sec = q.nelson_section || 'Uncategorized';
                sectionMarks[sec] = (sectionMarks[sec] || 0) + (parseFloat(q.marks) || 0);
            }});
            const markEntries = Object.entries(sectionMarks).sort((a, b) => b[1] - a[1]);
            new Chart(document.getElementById('chart-nelson-marks'), {{
                type: 'bar',
                data: {{
                    labels: markEntries.map(s => s[0].replace(/^\\d+\\.\\s*/, '').substring(0, 20)),
                    datasets: [{{
                        label: 'Total Marks',
                        data: markEntries.map(s => Math.round(s[1])),
                        backgroundColor: '#5856D6CC',
                        borderRadius: 8,
                        borderSkipped: false,
                    }}]
                }},
                options: {{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {{ legend: {{ display: false }} }},
                    scales: {{
                        x: {{ beginAtZero: true, grid: {{ color: 'rgba(255,255,255,0.05)' }} }},
                        y: {{ grid: {{ display: false }} }}
                    }}
                }}
            }});
        }}
        
        // Subjects page
        function renderSubjects() {{
            // Subject pie
            const subjectCounts = {{ 'Gastroenterology & Hepatology': 0, 'Nephrology & Urology': 0, 'Endocrinology': 0, 'Other': 0 }};
            const targetSections = {{
                'Gastroenterology & Hepatology': ['17. Digestive System', 'SECTION 17: Digestive System'],
                'Nephrology & Urology': ['22. Nephrology and Urology', 'SECTION 22: Nephrology and Urology'],
                'Endocrinology': ['23. Endocrinology', 'SECTION 23: Endocrinology']
            }};
            
            QUESTIONS.forEach(q => {{
                const sec = q.nelson_section || '';
                let found = false;
                for (const [subject, prefixes] of Object.entries(targetSections)) {{
                    if (prefixes.some(p => sec.includes(p))) {{
                        subjectCounts[subject]++;
                        found = true;
                        break;
                    }}
                }}
                if (!found) subjectCounts['Other']++;
            }});
            
            new Chart(document.getElementById('chart-subject-pie'), {{
                type: 'pie',
                data: {{
                    labels: Object.keys(subjectCounts),
                    datasets: [{{
                        data: Object.values(subjectCounts),
                        backgroundColor: ['#FF9500CC', '#007AFFCC', '#34C759CC', '#5856D6CC'],
                        borderWidth: 0,
                    }}]
                }},
                options: {{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {{
                        legend: {{ position: 'bottom', labels: {{ padding: 20 }} }}
                    }}
                }}
            }});
            
            // Cognitive levels
            const cognitive = {{ 'Recall': 12, 'Conceptual': 21, 'Clinical App': 14, 'Multi-step': 4 }};
            new Chart(document.getElementById('chart-cognitive'), {{
                type: 'bar',
                data: {{
                    labels: Object.keys(cognitive),
                    datasets: [{{
                        label: 'Questions',
                        data: Object.values(cognitive),
                        backgroundColor: ['#007AFFCC', '#5856D6CC', '#FF9500CC', '#FF2D55CC'],
                        borderRadius: 8,
                        borderSkipped: false,
                    }}]
                }},
                options: {{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {{ legend: {{ display: false }} }},
                    scales: {{
                        y: {{ beginAtZero: true, grid: {{ color: 'rgba(255,255,255,0.05)' }} }},
                        x: {{ grid: {{ display: false }} }}
                    }}
                }}
            }});
            
            // Subtopic table
            const subtopics = [
                {{ topic: 'AGN (PSGN)', subject: 'Nephrology', count: 6, marks: 42, prob: 'Very High' }},
                {{ topic: 'Rickets', subject: 'Endocrinology', count: 5, marks: 19, prob: 'Very High' }},
                {{ topic: 'Nephrotic Syndrome', subject: 'Nephrology', count: 3, marks: 17, prob: 'Very High' }},
                {{ topic: 'Congenital Hypothyroidism', subject: 'Endocrinology', count: 3, marks: 8, prob: 'High' }},
                {{ topic: 'Testicular Torsion', subject: 'Nephrology', count: 2, marks: 6, prob: 'High' }},
                {{ topic: 'Cryptorchidism', subject: 'Nephrology', count: 2, marks: 5, prob: 'High' }},
                {{ topic: 'Hematuria DDx', subject: 'Nephrology', count: 2, marks: 5, prob: 'High' }},
                {{ topic: 'Portal Hypertension', subject: 'GI', count: 2, marks: 4, prob: 'Moderate' }},
                {{ topic: 'Intussusception', subject: 'GI', count: 2, marks: 5, prob: 'Moderate' }},
                {{ topic: 'Neonatal Hypoglycemia', subject: 'Endocrinology', count: 3, marks: 5, prob: 'High' }},
            ];
            
            document.getElementById('subject-table').innerHTML = `
                <div class="table-header">
                    <div>Rank</div>
                    <div>Subtopic</div>
                    <div>Count</div>
                    <div>Marks</div>
                    <div>Probability</div>
                </div>
                ${{subtopics.map((s, i) => `
                    <div class="table-row">
                        <div class="table-cell"><span class="rank-badge ${{i < 3 ? 'top' : ''}}">${{i + 1}}</span></div>
                        <div class="table-cell">
                            <div>
                                <div class="topic-name">${{s.topic}}</div>
                                <div class="topic-meta">${{s.subject}}</div>
                            </div>
                        </div>
                        <div class="table-cell"><span class="count-pill">${{s.count}}</span></div>
                        <div class="table-cell"><span class="marks-pill">${{s.marks}}</span></div>
                        <div class="table-cell" style="color:${{s.prob === 'Very High' ? '#FF2D55' : s.prob === 'High' ? '#FF9500' : '#34C759'}};font-weight:600;font-size:13px;">${{s.prob}}</div>
                    </div>
                `).join('')}}
            `;
        }}
        
        // Predictions page
        function renderPredictions() {{
            const predictions = [
                {{ title: 'AGN (PSGN)', prob: 'Very High', desc: '6/24 nephrology questions. Predicted framing: 3-year-old with edema + tea-colored urine after sore throat → diagnosis, urinalysis, C3, management, complications.', color: 'hot' }},
                {{ title: 'Nephrotic Syndrome (First Episode)', prob: 'Very High', desc: '3/24 nephrology questions. Predicted framing: 4-year-old with periorbital edema + frothy urine → investigations, steroid regimen, complications.', color: 'hot' }},
                {{ title: 'Rickets', prob: 'Very High', desc: '5/14 endocrine questions. Predicted framing: 9-month-old with delayed teething + wrist swelling → biochemistry, X-ray, clinical features, treatment.', color: 'hot' }},
                {{ title: 'Congenital Hypothyroidism', prob: 'High', desc: '3/14 endocrine. Neonatal features + TSH screening + immediate thyroxine start.', color: 'warm' }},
                {{ title: 'Testicular Torsion', prob: 'High', desc: '2/24 nephrology. Emergency management. Doppler USG + surgery within 6 hours + bilateral fixation.', color: 'warm' }},
                {{ title: 'HUS', prob: 'Moderate', desc: 'Classic triad (anemia, thrombocytopenia, AKI). Never tested in dataset. Potential surprise 10-mark essay.', color: 'cool' }},
                {{ title: 'Biliary Atresia', prob: 'Moderate', desc: 'Neonatal cholestasis. Never tested. Kasai portoenterostomy timing (first 60 days).', color: 'cool' }},
                {{ title: 'DKA Management', prob: 'Moderate', desc: 'Type 1 DM. Never tested. Fluid resuscitation, insulin drip, monitoring.', color: 'cool' }},
            ];
            
            document.getElementById('prediction-grid').innerHTML = predictions.map(p => `
                <div class="prediction-card ${{p.color}}">
                    <div class="prediction-badge ${{p.color}}">${{p.prob}} Probability</div>
                    <div class="prediction-title">${{p.title}}</div>
                    <div class="prediction-desc">${{p.desc}}</div>
                </div>
            `).join('');
        }}
        
        // Heatmap
        function renderHeatmap() {{
            const topChapters = Object.entries(data.chapters)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 15)
                .map(c => c[0]);
            
            const yearLabels = Object.keys(data.years).sort();
            const datasets = topChapters.map((chapter, i) => {{
                const colors = ['#007AFF', '#5856D6', '#AF52DE', '#FF2D55', '#FF9500', '#34C759', '#00C7BE', '#5AC8FA', '#64D2FF', '#BF5AF2', '#30B0C7', '#A2845E', '#8E8E93', '#C7C7CC', '#D1D1D6'];
                return {{
                    label: chapter.replace(/^\\d+\\.\\s*/, '').substring(0, 25),
                    data: yearLabels.map(year => {{
                        return QUESTIONS.filter(q => q.exam_year == year && q.nelson_chapter === chapter).length;
                    }}),
                    backgroundColor: colors[i % colors.length] + 'AA',
                    borderColor: colors[i % colors.length],
                    borderWidth: 1,
                    fill: true,
                    tension: 0.3,
                }};
            }});
            
            new Chart(document.getElementById('chart-heatmap'), {{
                type: 'line',
                data: {{
                    labels: yearLabels,
                    datasets: datasets
                }},
                options: {{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {{
                        mode: 'index',
                        intersect: false,
                    }},
                    plugins: {{
                        legend: {{
                            position: 'bottom',
                            labels: {{ boxWidth: 10, padding: 10, font: {{ size: 11 }} }}
                        }}
                    }},
                    scales: {{
                        y: {{
                            beginAtZero: true,
                            stacked: true,
                            grid: {{ color: 'rgba(255,255,255,0.05)' }}
                        }},
                        x: {{
                            grid: {{ display: false }}
                        }}
                    }}
                }}
            }});
        }}
    </script>
</body>
</html>
'''

output_path = os.path.join(OUTPUT_DIR, "dashboard.html")
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

print(f"Generated dashboard: {output_path}")
print(f"File size: {os.path.getsize(output_path) / 1024:.1f} KB")
print(f"\nTo view, run:")
print(f"  cd '{OUTPUT_DIR}' && python -m http.server 8080")
print(f"Then open: http://localhost:8080/dashboard.html")
