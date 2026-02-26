// ── MOBILE NAV ──
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Mobile dropdown
    document.getElementById('classicalItem').addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            this.classList.toggle('open');
            e.stopPropagation();
        }
    });

    // Close nav when link clicked
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Smooth scroll with nav offset
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ── CIPHER LOGIC ──
    function caesarShift(text, shift, decrypt = false) {
        if (decrypt) shift = -shift;
        return text.toUpperCase().replace(/[A-Z]/g, c => {
            const code = ((c.charCodeAt(0) - 65 + shift) % 26 + 26) % 26;
            return String.fromCharCode(code + 65);
        });
    }

    function caesarEncrypt() {
        const text = document.getElementById('caesarInput').value;
        const shift = parseInt(document.getElementById('caesarShift').value) || 3;
        const result = caesarShift(text, shift);
        document.getElementById('caesarOutput').innerHTML = `<strong>Encrypted:</strong> ${result}`;
    }

    function caesarDecrypt() {
        const text = document.getElementById('caesarInput').value;
        const shift = parseInt(document.getElementById('caesarShift').value) || 3;
        const result = caesarShift(text, shift, true);
        document.getElementById('caesarOutput').innerHTML = `<strong>Decrypted:</strong> ${result}`;
    }

    function shiftEncrypt() {
        const text = document.getElementById('shiftInput').value;
        const shift = parseInt(document.getElementById('shiftValue').value) || 13;
        const result = caesarShift(text, shift);
        document.getElementById('shiftOutput').innerHTML = `<strong>Encrypted (shift ${shift}):</strong> ${result}`;
    }

    function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

    function modInverse(a, m) {
        for (let x = 1; x < m; x++) if ((a * x) % m === 1) return x;
        return -1;
    }

    function affineEncrypt() {
        const text = document.getElementById('affineInput').value;
        const a = parseInt(document.getElementById('affineA').value) || 5;
        const b = parseInt(document.getElementById('affineB').value) || 8;
        if (gcd(a, 26) !== 1) {
            document.getElementById('affineOutput').innerHTML = `<strong>Error:</strong> 'a' must be coprime with 26. Use: 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, or 25.`;
            return;
        }
        const result = text.toUpperCase().replace(/[A-Z]/g, c => {
            const x = c.charCodeAt(0) - 65;
            return String.fromCharCode(((a * x + b) % 26) + 65);
        });
        document.getElementById('affineOutput').innerHTML = `<strong>Encrypted (a=${a}, b=${b}):</strong> ${result}`;
    }

    function transpositionEncrypt() {
        const text = document.getElementById('transInput').value.toUpperCase().replace(/[^A-Z]/g, '');
        const keyword = document.getElementById('transKey').value.toUpperCase();
        if (!keyword || !text) {
            document.getElementById('transOutput').innerHTML = '<strong>Error:</strong> Please enter both text and a keyword.';
            return;
        }
        const sorted = keyword.split('').map((char, idx) => ({ char, idx }))
            .sort((a, b) => a.char.localeCompare(b.char));
        const columnOrder = sorted.map(item => item.idx);
        const numCols = keyword.length;
        const numRows = Math.ceil(text.length / numCols);
        const padded = text.padEnd(numRows * numCols, 'X');
        let grid = [];
        for (let i = 0; i < numRows; i++) grid.push(padded.slice(i * numCols, (i + 1) * numCols).split(''));
        let result = '';
        for (let ci of columnOrder) for (let row of grid) result += row[ci];
        document.getElementById('transOutput').innerHTML =
            `<strong>Encrypted:</strong> ${result}<br><small style="color:#64748b">Column order: ${columnOrder.map(i => i+1).join(', ')}</small>`;
    }

    function modPow(base, exp, mod) {
        if (mod === 1) return 0;
        let result = 1;
        base = base % mod;
        while (exp > 0) {
            if (exp % 2 === 1) result = (result * base) % mod;
            exp = Math.floor(exp / 2);
            base = (base * base) % mod;
        }
        return result;
    }

    function rsaDemo() {
        const M = parseInt(document.getElementById('rsaMessage').value);
        const p = parseInt(document.getElementById('rsaP').value);
        const q = parseInt(document.getElementById('rsaQ').value);
        const e = parseInt(document.getElementById('rsaE').value);
        if (!M || !p || !q || !e) { document.getElementById('rsaOutput').innerHTML = '<strong>Error:</strong> Fill in all fields.'; return; }
        const n = p * q, phi = (p - 1) * (q - 1);
        if (M >= n) { document.getElementById('rsaOutput').innerHTML = `<strong>Error:</strong> Message must be less than n = ${n}.`; return; }
        if (gcd(e, phi) !== 1) { document.getElementById('rsaOutput').innerHTML = '<strong>Error:</strong> e must be coprime with φ(n).'; return; }
        const d = modInverse(e, phi);
        if (d === -1) { document.getElementById('rsaOutput').innerHTML = '<strong>Error:</strong> Could not compute private key.'; return; }
        const C = modPow(M, e, n);
        const dec = modPow(C, d, n);
        document.getElementById('rsaOutput').innerHTML = `
            <strong>Public Key:</strong> (e = ${e}, n = ${n})<br>
            <strong>Private Key:</strong> (d = ${d}, n = ${n})<br>
            <strong>φ(n):</strong> ${phi}<br><br>
            <strong>Original Message M:</strong> ${M}<br>
            <strong>Encrypted C:</strong> ${C}<br>
            <strong>Decrypted back:</strong> ${dec}<br><br>
            ${M === dec ? 'Encryption &amp; Decryption successful!' : 'Something went wrong.'}
        `;
    }