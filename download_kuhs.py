import urllib.request
import re
import os
from concurrent.futures import ThreadPoolExecutor, as_completed

base_url = "http://www2.kuhs.ac.in/kuhs_new/index.php?id=14&folder=MEDICAL/UG/THIRD_Y_PART2/{}"

folders = [
    "2015_APRIL", "2015_SEPTEMBER",
    "2016_APRIL", "2016_SEPTEMBER",
    "2017_MARCH", "2017_SEPTEMBER",
    "2018_AUGUST", "2018_FEBRUARY",
    "2019_AUGUST", "2019_FEBRUARY",
    "2020_FEBRUARY", "2020_OCTOBER",
    "2021_MAY", "2021_NOVEMBER",
    "2022_APRIL", "2022_MARCH", "2022_SEPTEMBER",
    "2023_AUGUST", "2023_MARCH",
    "2024_AUGUST", "2024_JULY", "2024_MARCH",
    "2025_APRIL", "2025_MAY"
]

pediatrics_codes = ["311001.pdf", "320001.pdf"]

output_dir = "/Users/akashstephen/Developer/Pediatrics Exam"
os.makedirs(output_dir, exist_ok=True)

def fetch_folder(folder):
    url = base_url.format(folder)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as response:
            content = response.read().decode('utf-8', errors='ignore')
        pdf_links = re.findall(r'href="(http://www2\.kuhs\.ac\.in/kuhs_new/images/uploads/pdf/questionpapers/MEDICAL/UG/THIRD_Y_PART2/[^"]+\.pdf)"', content)
        return folder, pdf_links
    except Exception as e:
        return folder, []

def download_pdf(folder, pdf_url):
    filename = pdf_url.split('/')[-1]
    save_name = f"{folder}_{filename}"
    save_path = os.path.join(output_dir, save_name)
    
    if os.path.exists(save_path):
        return f"Already exists: {save_name}"
    
    try:
        req = urllib.request.Request(pdf_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=30) as response:
            data = response.read()
        with open(save_path, 'wb') as f:
            f.write(data)
        return f"Downloaded: {save_name} ({len(data)} bytes)"
    except Exception as e:
        return f"Failed: {save_name} - {str(e)}"

print("Scanning all folders for pediatrics papers (311001 & 320001)...")
print("=" * 65)

all_pdfs_to_download = []

with ThreadPoolExecutor(max_workers=5) as executor:
    futures = {executor.submit(fetch_folder, folder): folder for folder in folders}
    for future in as_completed(futures):
        folder, links = future.result()
        
        found = []
        for link in links:
            filename = link.split('/')[-1]
            if filename in pediatrics_codes:
                found.append(link)
                all_pdfs_to_download.append((folder, link))
        
        if found:
            print(f"✓ {folder}: Found {', '.join([l.split('/')[-1] for l in found])}")
        else:
            print(f"  {folder}: Not found")

print("\n" + "=" * 65)
print(f"Total pediatrics papers found: {len(all_pdfs_to_download)}")
print("=" * 65)

if all_pdfs_to_download:
    print("\nDownloading papers...")
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(download_pdf, folder, link): (folder, link) for folder, link in all_pdfs_to_download}
        for future in as_completed(futures):
            print(future.result())
    
    print("\n" + "=" * 65)
    print("Download complete!")
    print(f"Files saved to: {output_dir}")
