@echo off
REM LedgerSnap Bank-Specific YouTube Video Generator
echo ====================================================
echo 🎬 Rendering 10 Bank-Specific Demo Video Variants
echo ====================================================

if not exist "C:\Users\moshi\OneDrive\Desktop\new_ideas\scripts\growth\generated-videos" mkdir "C:\Users\moshi\OneDrive\Desktop\new_ideas\scripts\growth\generated-videos"

echo Rendering Chase variant...
ffmpeg -y -i "C:\Users\moshi\OneDrive\Desktop\new_ideas\frontend\public\demo\ledgersnap-qbo-demo.mp4" -vf "drawbox=y=30:color=black@0.75:width=iw:height=120:enable='between(t,0,6)',drawtext=text='Chase Statement to QuickBooks .QBO':fontcolor=white:fontsize=38:x=(w-text_w)/2:y=48:enable='between(t,0,6)',drawtext=text='100%% Math Checksum Verified * ledger-snap.com/convert/chase-pdf-to-qbo':fontcolor=0x38bdf8:fontsize=22:x=(w-text_w)/2:y=102:enable='between(t,0,6)'" -c:v libx264 -preset fast -crf 20 -c:a copy "C:\Users\moshi\OneDrive\Desktop\new_ideas\scripts\growth\generated-videos\chase-pdf-to-qbo-demo.mp4"

echo Rendering Bank of America variant...
ffmpeg -y -i "C:\Users\moshi\OneDrive\Desktop\new_ideas\frontend\public\demo\ledgersnap-qbo-demo.mp4" -vf "drawbox=y=30:color=black@0.75:width=iw:height=120:enable='between(t,0,6)',drawtext=text='Bank of America Statement to QuickBooks .QBO':fontcolor=white:fontsize=38:x=(w-text_w)/2:y=48:enable='between(t,0,6)',drawtext=text='100%% Math Checksum Verified * ledger-snap.com/convert/bank-of-america-pdf-to-qbo':fontcolor=0x38bdf8:fontsize=22:x=(w-text_w)/2:y=102:enable='between(t,0,6)'" -c:v libx264 -preset fast -crf 20 -c:a copy "C:\Users\moshi\OneDrive\Desktop\new_ideas\scripts\growth\generated-videos\bank-of-america-pdf-to-qbo-demo.mp4"

echo Rendering Wells Fargo variant...
ffmpeg -y -i "C:\Users\moshi\OneDrive\Desktop\new_ideas\frontend\public\demo\ledgersnap-qbo-demo.mp4" -vf "drawbox=y=30:color=black@0.75:width=iw:height=120:enable='between(t,0,6)',drawtext=text='Wells Fargo Statement to QuickBooks .QBO':fontcolor=white:fontsize=38:x=(w-text_w)/2:y=48:enable='between(t,0,6)',drawtext=text='100%% Math Checksum Verified * ledger-snap.com/convert/wells-fargo-pdf-to-qbo':fontcolor=0x38bdf8:fontsize=22:x=(w-text_w)/2:y=102:enable='between(t,0,6)'" -c:v libx264 -preset fast -crf 20 -c:a copy "C:\Users\moshi\OneDrive\Desktop\new_ideas\scripts\growth\generated-videos\wells-fargo-pdf-to-qbo-demo.mp4"

echo Rendering Citibank variant...
ffmpeg -y -i "C:\Users\moshi\OneDrive\Desktop\new_ideas\frontend\public\demo\ledgersnap-qbo-demo.mp4" -vf "drawbox=y=30:color=black@0.75:width=iw:height=120:enable='between(t,0,6)',drawtext=text='Citibank Statement to QuickBooks .QBO':fontcolor=white:fontsize=38:x=(w-text_w)/2:y=48:enable='between(t,0,6)',drawtext=text='100%% Math Checksum Verified * ledger-snap.com/convert/citibank-pdf-to-qbo':fontcolor=0x38bdf8:fontsize=22:x=(w-text_w)/2:y=102:enable='between(t,0,6)'" -c:v libx264 -preset fast -crf 20 -c:a copy "C:\Users\moshi\OneDrive\Desktop\new_ideas\scripts\growth\generated-videos\citibank-pdf-to-qbo-demo.mp4"

echo Rendering Capital One variant...
ffmpeg -y -i "C:\Users\moshi\OneDrive\Desktop\new_ideas\frontend\public\demo\ledgersnap-qbo-demo.mp4" -vf "drawbox=y=30:color=black@0.75:width=iw:height=120:enable='between(t,0,6)',drawtext=text='Capital One Statement to QuickBooks .QBO':fontcolor=white:fontsize=38:x=(w-text_w)/2:y=48:enable='between(t,0,6)',drawtext=text='100%% Math Checksum Verified * ledger-snap.com/convert/capital-one-pdf-to-qbo':fontcolor=0x38bdf8:fontsize=22:x=(w-text_w)/2:y=102:enable='between(t,0,6)'" -c:v libx264 -preset fast -crf 20 -c:a copy "C:\Users\moshi\OneDrive\Desktop\new_ideas\scripts\growth\generated-videos\capital-one-pdf-to-qbo-demo.mp4"

echo Rendering American Express variant...
ffmpeg -y -i "C:\Users\moshi\OneDrive\Desktop\new_ideas\frontend\public\demo\ledgersnap-qbo-demo.mp4" -vf "drawbox=y=30:color=black@0.75:width=iw:height=120:enable='between(t,0,6)',drawtext=text='American Express Statement to QuickBooks .QBO':fontcolor=white:fontsize=38:x=(w-text_w)/2:y=48:enable='between(t,0,6)',drawtext=text='100%% Math Checksum Verified * ledger-snap.com/convert/american-express-pdf-to-qbo':fontcolor=0x38bdf8:fontsize=22:x=(w-text_w)/2:y=102:enable='between(t,0,6)'" -c:v libx264 -preset fast -crf 20 -c:a copy "C:\Users\moshi\OneDrive\Desktop\new_ideas\scripts\growth\generated-videos\american-express-pdf-to-qbo-demo.mp4"

echo Rendering Mercury variant...
ffmpeg -y -i "C:\Users\moshi\OneDrive\Desktop\new_ideas\frontend\public\demo\ledgersnap-qbo-demo.mp4" -vf "drawbox=y=30:color=black@0.75:width=iw:height=120:enable='between(t,0,6)',drawtext=text='Mercury Statement to QuickBooks .QBO':fontcolor=white:fontsize=38:x=(w-text_w)/2:y=48:enable='between(t,0,6)',drawtext=text='100%% Math Checksum Verified * ledger-snap.com/convert/mercury-bank-pdf-to-qbo':fontcolor=0x38bdf8:fontsize=22:x=(w-text_w)/2:y=102:enable='between(t,0,6)'" -c:v libx264 -preset fast -crf 20 -c:a copy "C:\Users\moshi\OneDrive\Desktop\new_ideas\scripts\growth\generated-videos\mercury-bank-pdf-to-qbo-demo.mp4"

echo Rendering TD Bank variant...
ffmpeg -y -i "C:\Users\moshi\OneDrive\Desktop\new_ideas\frontend\public\demo\ledgersnap-qbo-demo.mp4" -vf "drawbox=y=30:color=black@0.75:width=iw:height=120:enable='between(t,0,6)',drawtext=text='TD Bank Statement to QuickBooks .QBO':fontcolor=white:fontsize=38:x=(w-text_w)/2:y=48:enable='between(t,0,6)',drawtext=text='100%% Math Checksum Verified * ledger-snap.com/convert/td-bank-pdf-to-qbo':fontcolor=0x38bdf8:fontsize=22:x=(w-text_w)/2:y=102:enable='between(t,0,6)'" -c:v libx264 -preset fast -crf 20 -c:a copy "C:\Users\moshi\OneDrive\Desktop\new_ideas\scripts\growth\generated-videos\td-bank-pdf-to-qbo-demo.mp4"

echo Rendering PNC Bank variant...
ffmpeg -y -i "C:\Users\moshi\OneDrive\Desktop\new_ideas\frontend\public\demo\ledgersnap-qbo-demo.mp4" -vf "drawbox=y=30:color=black@0.75:width=iw:height=120:enable='between(t,0,6)',drawtext=text='PNC Bank Statement to QuickBooks .QBO':fontcolor=white:fontsize=38:x=(w-text_w)/2:y=48:enable='between(t,0,6)',drawtext=text='100%% Math Checksum Verified * ledger-snap.com/convert/pnc-bank-pdf-to-qbo':fontcolor=0x38bdf8:fontsize=22:x=(w-text_w)/2:y=102:enable='between(t,0,6)'" -c:v libx264 -preset fast -crf 20 -c:a copy "C:\Users\moshi\OneDrive\Desktop\new_ideas\scripts\growth\generated-videos\pnc-bank-pdf-to-qbo-demo.mp4"

echo Rendering U.S. Bank variant...
ffmpeg -y -i "C:\Users\moshi\OneDrive\Desktop\new_ideas\frontend\public\demo\ledgersnap-qbo-demo.mp4" -vf "drawbox=y=30:color=black@0.75:width=iw:height=120:enable='between(t,0,6)',drawtext=text='U.S. Bank Statement to QuickBooks .QBO':fontcolor=white:fontsize=38:x=(w-text_w)/2:y=48:enable='between(t,0,6)',drawtext=text='100%% Math Checksum Verified * ledger-snap.com/convert/us-bank-pdf-to-qbo':fontcolor=0x38bdf8:fontsize=22:x=(w-text_w)/2:y=102:enable='between(t,0,6)'" -c:v libx264 -preset fast -crf 20 -c:a copy "C:\Users\moshi\OneDrive\Desktop\new_ideas\scripts\growth\generated-videos\us-bank-pdf-to-qbo-demo.mp4"

echo All 10 bank video variants rendered successfully into C:\Users\moshi\OneDrive\Desktop\new_ideas\scripts\growth\generated-videos!
pause
