(function () {
    var root = document.documentElement;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Hero: name fills the content width, small line tracked to the same width
    function fitHero() {
        var name = document.getElementById("heroName");
        var sub = document.getElementById("heroSub");
        var wrap = name.closest(".wrap");
        var cs = getComputedStyle(wrap);
        var width = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);

        name.style.fontSize = "";
        name.style.marginRight = "";
        var size = parseFloat(getComputedStyle(name).fontSize);
        var spacing = parseFloat(getComputedStyle(name).letterSpacing) || 0;
        var w = name.getBoundingClientRect().width - spacing;
        name.style.fontSize = (size * width / w) + "px";
        name.style.marginRight = (-parseFloat(getComputedStyle(name).letterSpacing)) + "px";

        sub.style.letterSpacing = "0px";
        sub.style.marginRight = "";
        var base = sub.getBoundingClientRect().width;
        var gaps = sub.textContent.length;
        var extra = Math.max(0, (width - base) / gaps);
        sub.style.letterSpacing = extra + "px";
        sub.style.marginRight = (-extra) + "px";
    }

    // Sliding nav line and active section
    var links = Array.prototype.slice.call(document.querySelectorAll("[data-link]"));
    var line = document.getElementById("navLine");
    var nav = document.getElementById("nav");
    var sections = Array.prototype.slice.call(document.querySelectorAll("[data-section]"));
    var current = null;

    function moveLine(link) {
        if (!link) return;
        var box = line.parentNode.getBoundingClientRect();
        var r = link.getBoundingClientRect();
        line.style.width = r.width + "px";
        line.style.transform = "translate(" + (r.left - box.left + line.parentNode.scrollLeft) + "px, " + (link.classList.contains("nav-home") ? (r.bottom - box.bottom) : 0) + "px)";
    }

    function update() {
        var y = window.innerHeight * 0.45;
        var active = sections[0];
        sections.forEach(function (s) { if (s.getBoundingClientRect().top <= y) active = s; });
        if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
            active = sections[sections.length - 1];
        }
        if (active === current) return;
        current = active;
        var link = links.filter(function (l) { return l.getAttribute("href") === "#" + active.id; })[0];
        links.forEach(function (l) { l.style.opacity = l === link ? "1" : "0.55"; });
        moveLine(link);
    }

    var ticking = false;
    window.addEventListener("scroll", function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () { update(); ticking = false; });
    }, { passive: true });
    window.addEventListener("resize", function () { fitHero(); current = null; update(); });

    // Scroll reveal
    var items = document.querySelectorAll("section .row > *, .statement p, footer > *");
    items.forEach(function (el) { el.classList.add("reveal"); });
    if ("IntersectionObserver" in window && !reduce) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
            });
        }, { threshold: 0.1 });
        items.forEach(function (el) { io.observe(el); });
    } else {
        items.forEach(function (el) { el.classList.add("in"); });
    }

    // Splash then hero entrance
    var splash = document.getElementById("splash");
    var started = false;
    function start() {
        if (started) return;
        started = true;
        root.classList.add("ready");
    }
    function skip() {
        if (splash) splash.style.display = "none";
        start();
    }
    function init() {
        fitHero();
        update();
        if (reduce || !splash) { start(); return; }
        setTimeout(start, 2300);
        splash.addEventListener("click", skip);
        window.addEventListener("keydown", skip, { once: true });
    }

    if (document.fonts && document.fonts.load) {
        Promise.all([
            document.fonts.load('700 40px "Josefin Sans"'),
            document.fonts.load('600 12px "Manrope"')
        ]).then(init, init);
    } else {
        window.addEventListener("load", init);
    }
    setTimeout(start, 4000);
})();
