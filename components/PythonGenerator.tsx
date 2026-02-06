
import React, { useState } from 'react';

const PythonGenerator: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const pythonScript = `
import asyncio
import csv
import os
from playwright.async_api import async_playwright

# --- CONFIGURATION ---
BASE_URL = "https://network.procore.com"
START_URL = "https://network.procore.com/us/ca?types=general-contractors"
OUTPUT_FILE = "procore_contractors_detailed.csv"

async def scrape_procore_deep():
    async with async_playwright() as p:
        print("🚀 Starting Procore Deep Scraper...")
        
        # Launch browser - headless=False allows you to watch the progress
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        
        print(f"📂 Navigating to listings: {START_URL}")
        await page.goto(START_URL, wait_until="networkidle")

        # 1. Identify all company profile links
        # Procore uses dynamic loading; we wait for the cards to appear
        await page.wait_for_selector('a[href*="/network/p/"]', timeout=30000)
        
        links = await page.query_selector_all('a[href*="/network/p/"]')
        profile_urls = []
        for link in links:
            href = await link.get_attribute('href')
            if href and "/network/p/" in href:
                # Ensure we have the full URL
                full_url = f"{BASE_URL}{href}" if href.startswith('/') else href
                if full_url not in profile_urls:
                    profile_urls.append(full_url)

        print(f"🎯 Found {len(profile_urls)} unique company profiles to analyze.")
        
        results = []

        # 2. Iterate through each profile for deep extraction
        for i, url in enumerate(profile_urls):
            print(f"🔍 [{i+1}/{len(profile_urls)}] Deep scanning: {url}")
            try:
                profile_page = await context.new_page()
                # Use a longer timeout for sub-pages
                await profile_page.goto(url, wait_until="domcontentloaded", timeout=60000)
                await asyncio.sleep(2) # Wait for JS to render contact buttons
                
                # Scrape Fields
                name = await profile_page.inner_text('h1') if await profile_page.query_selector('h1') else "N/A"
                
                # Phone extraction
                phone_el = await profile_page.query_selector('a[href^="tel:"]')
                phone = await phone_el.inner_text() if phone_el else "N/A"
                
                # Email extraction (looking for mailto links)
                email_el = await profile_page.query_selector('a[href^="mailto:"]')
                email = (await email_el.get_attribute('href')).replace('mailto:', '') if email_el else "N/A"
                
                # Website extraction
                website_el = await profile_page.query_selector('a[data-qa*="website"], a[target="_blank"]')
                website = "N/A"
                if website_el:
                    href = await website_el.get_attribute('href')
                    if href and "procore.com" not in href: # Avoid internal links
                        website = href
                
                # Address extraction
                address_el = await profile_page.query_selector('div[class*="Address"], address')
                address = await address_el.inner_text() if address_el else "N/A"

                results.append({
                    'Company Name': name.strip(),
                    'Phone': phone.strip(),
                    'Email': email.strip(),
                    'Website': website.strip(),
                    'Address': address.strip().replace('\\n', ', '),
                    'Source URL': url
                })
                
                await profile_page.close()
                # Respectful delay between requests
                await asyncio.sleep(1.5)
                
            except Exception as e:
                print(f"⚠️ Error scanning {url}: {str(e)}")
                if 'profile_page' in locals(): await profile_page.close()

        # 3. Consolidate into CSV
        if results:
            keys = results[0].keys()
            with open(OUTPUT_FILE, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=keys)
                writer.writeheader()
                writer.writerows(results)
            print(f"✅ SUCCESS: {len(results)} companies consolidated into '{OUTPUT_FILE}'")
        else:
            print("❌ No data was extracted.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(scrape_procore_deep())
`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 rounded-xl p-6 shadow-2xl border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          Deep Search Python Scraper
        </h3>
        <button 
          onClick={handleCopy}
          className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-lg active:scale-95"
        >
          {copied ? '✅ Copied' : 'Copy Full Script'}
        </button>
      </div>
      <div className="relative group">
        <div className="absolute inset-0 bg-blue-500/5 rounded-lg pointer-events-none"></div>
        <pre className="text-blue-200 font-mono text-xs md:text-sm overflow-x-auto p-5 bg-slate-950 rounded-lg border border-slate-800 leading-relaxed max-h-[500px]">
          <code>{pythonScript}</code>
        </pre>
      </div>
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-400 text-xs">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-emerald-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          <span>Consolidates data into <strong>procore_contractors_detailed.csv</strong> automatically.</span>
        </div>
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-emerald-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          <span>Deep-dives into company profiles to extract hidden emails and websites.</span>
        </div>
      </div>
    </div>
  );
};

export default PythonGenerator;
