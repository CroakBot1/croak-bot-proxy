// ================= FULL MERGED GOD-TIER DEVTOOLS FIREWALL V1-V10 =================
(async function() {
    // ================= Memory & State =================
    let devtoolsOpen = {console:false, elements:false, network:false};
    let detectionMemory = JSON.parse(localStorage.getItem('devtoolsMemory') || '{}');
    let behaviorMemory = JSON.parse(localStorage.getItem('behaviorMemory') || '{}');
    let beepCtx = new (window.AudioContext || window.webkitAudioContext)();

    // ================= Audio & Speech =================
    function playBeep(type,severity=1){
        const osc = beepCtx.createOscillator();
        osc.type = 'square';
        const freqBase = type==='tab'?660:type==='console'?550:type==='network'?700:440;
        osc.frequency.setValueAtTime(freqBase + Math.random()*200*severity, beepCtx.currentTime);
        const gain = beepCtx.createGain();
        gain.gain.setValueAtTime(0.25 + Math.random()*0.2*severity, beepCtx.currentTime);
        osc.connect(gain); gain.connect(beepCtx.destination); osc.start(); osc.stop(beepCtx.currentTime + 0.3 + Math.random()*0.2);
    }

    function playFrogSound(severity=1){
        const audio = new Audio('https://www.soundjay.com/nature/frog-croak-01.mp3');
        audio.volume = Math.min(0.3 + Math.random()*0.2*severity,1); audio.play();
    }

    function speakWarning(message,severity=1){
        if('speechSynthesis' in window){
            const utter = new SpeechSynthesisUtterance(message);
            utter.pitch = Math.min(0.5 + Math.random()*0.5*severity,2);
            utter.rate = Math.min(0.8 + Math.random()*0.4*severity,2);
            window.speechSynthesis.speak(utter);
        }
    }

    // ================= Overlay & Frog Mascot =================
    function createOverlay(message="Access Denied"){
        const overlay=document.createElement('div');
        overlay.id='firewallOverlay';
        overlay.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:black;color:lime;font-size:40px;font-family:Arial,sans-serif;display:flex;justify-content:center;align-items:center;z-index:9999;overflow:hidden';
        overlay.innerHTML=`<marquee behavior="alternate" scrollamount="12">🐸 ${message} 🐸</marquee>
        <div id="frogMascot" style="position:absolute;width:120px;height:120px;top:50%;left:50%;transform:translate(-50%,-50%)">
            <div style="width:100%;height:100%;background:green;border-radius:50%;position:relative;">
                <div class="eye left" style="width:15px;height:15px;background:white;border-radius:50%;position:absolute;top:20px;left:20px;"></div>
                <div class="eye right" style="width:15px;height:15px;background:white;border-radius:50%;position:absolute;top:20px;right:20px;"></div>
                <div class="mouth" style="width:50px;height:10px;background:red;border-radius:5px;position:absolute;bottom:20px;left:25px;"></div>
                <div class="speech" style="position:absolute;top:-50px;width:300px;text-align:center;color:yellow;font-size:18px;"></div>
            </div>
        </div>`;
        document.body.innerHTML=''; document.body.appendChild(overlay);
        animateFrog(); return document.querySelector('#frogMascot div .speech');
    }

    function animateFrog(){
        const frog=document.querySelector('#frogMascot div');
        const eyes={left:frog.querySelector('.eye.left'),right:frog.querySelector('.eye.right')};
        const mouth=frog.querySelector('.mouth');
        const overlayDiv=document.getElementById('frogMascot');
        setInterval(()=>{
            overlayDiv.style.top=(20+Math.random()*60)+'%';
            overlayDiv.style.left=(20+Math.random()*60)+'%';
            eyes.left.style.height=(5+Math.random()*15)+'px';
            eyes.right.style.height=(5+Math.random()*15)+'px';
            mouth.style.width=(30+Math.random()*20)+'px';
            mouth.style.height=(5+Math.random()*10)+'px';
        },500); return frog.querySelector('.speech');
    }

    // ================= AI-Powered Dialogue =================
    function getAIFrogMessage(type){
        if(!behaviorMemory[type]) behaviorMemory[type]=0;
        const count = behaviorMemory[type];
        const messages={
            console:["Console snooper!","Console bites back!","More console mischief!","Persistent console user!"],
            elements:["DOM poking detected!","Hands off!","DOM intrusion!","Curious DOM spy!"],
            network:["Network sniffing!","Network spy detected!","Fetching attention!","Detected network intrusion!"],
            tab:["Multiple tabs detected!","Another tab? Frog sees all!","Tab infiltration!","Persistent tab opener!"]
        };
        return messages[type][Math.min(count,messages[type].length-1)];
    }

    function setFrogExpression(type,severity=1){
        const frog=document.querySelector('#frogMascot div'); if(!frog) return;
        const eyes={left:frog.querySelector('.eye.left'),right:frog.querySelector('.eye.right')};
        const mouth=frog.querySelector('.mouth'); const speech=frog.querySelector('.speech');
        switch(type){
            case 'console': eyes.left.style.height=25*severity+'px'; eyes.right.style.height=25*severity+'px'; mouth.style.width=50*severity+'px'; mouth.style.height=20*severity+'px'; break;
            case 'elements': eyes.left.style.height=10*severity+'px'; eyes.right.style.height=10*severity+'px'; mouth.style.width=40*severity+'px'; mouth.style.height=5*severity+'px'; break;
            case 'network': eyes.left.style.height=5*severity+'px'; eyes.right.style.height=5*severity+'px'; mouth.style.width=60*severity+'px'; mouth.style.height=15*severity+'px'; break;
            case 'tab': eyes.left.style.height=15*severity+'px'; eyes.right.style.height=15*severity+'px'; mouth.style.width=70*severity+'px'; mouth.style.height=10*severity+'px'; break;
        }
        const msg=getAIFrogMessage(type);
        if(speech)speech.innerText=msg;
        speakWarning(msg,severity); playBeep(type,severity); playFrogSound(severity);
        behaviorMemory[type]=severity; localStorage.setItem('behaviorMemory',JSON.stringify(behaviorMemory));
    }

    function escalateDetection(type){ if(!detectionMemory[type]) detectionMemory[type]=0; detectionMemory[type]++; localStorage.setItem('devtoolsMemory',JSON.stringify(detectionMemory)); }
    function triggerDetection(type,message){ escalateDetection(type); createOverlay(message); setFrogExpression(type); }

    // ================= DevTools Detection =================
    function detectDebugger(){ const start=Date.now(); debugger; if(Date.now()-start>100&&!devtoolsOpen.console){ devtoolsOpen.console=true; triggerDetection('console',"Console Detected!"); } }

    const element=new Image(); Object.defineProperty(element,'id',{get:function(){ if(!devtoolsOpen.elements){ devtoolsOpen.elements=true; triggerDetection('elements',"Elements Tab Detected!"); } }});

    let lastTime=performance.now();
    function detectNetworkTab(){ const now=performance.now(); if(now-lastTime>1000&&!devtoolsOpen.network){ devtoolsOpen.network=true; triggerDetection('network',"Network Tab Detected!"); } lastTime=now; }

    // Multi-tab detection
    localStorage.setItem('tab_check',Date.now());
    window.addEventListener('storage',function(e){ if(e.key==='tab_check') triggerDetection('tab',"Another Tab Detected!"); });

    ['contextmenu','selectstart','copy','paste'].forEach(evt=>document.addEventListener(evt,e=>e.preventDefault()));
    setInterval(()=>{ console.log(element); detectDebugger(); detectNetworkTab(); },150);

    // ================= Webcam / Face Detection =================
    async function initWebcam(){
        try{
            const stream = await navigator.mediaDevices.getUserMedia({video:true,audio:false});
            const video = document.createElement('video'); video.srcObject = stream; video.play(); video.style.display='none'; document.body.appendChild(video);
            const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
            setInterval(()=>{
                canvas.width = video.videoWidth; canvas.height = video.videoHeight;
                ctx.drawImage(video,0,0,canvas.width,canvas.height);
                const frame = ctx.getImageData(0,0,canvas.width,canvas.height).data;
                let avgBrightness=0; for(let i=0;i<frame.length;i+=4){ avgBrightness += frame[i]+frame[i+1]+frame[i+2]; }
                avgBrightness /= frame.length/4;
                if(avgBrightness<30){ setFrogExpression('tab',3); } // user hiding or dimming
            },500);
        }catch(e){ console.warn("Webcam access denied or unavailable."); }
    }

    initWebcam();
})();
