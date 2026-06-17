import re

html_file = r'index.html'
with open(html_file, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    (r'<a href="#hero" class="nav-link" id="nav-home">Home</a>', r'<a href="#hero" class="nav-link" id="nav-home" data-i18n="navHome">Home</a>'),
    (r'<a href="#about" class="nav-link" id="nav-about">About</a>', r'<a href="#about" class="nav-link" id="nav-about" data-i18n="navAbout">About</a>'),
    (r'Available for new opportunities', r'<span data-i18n="heroBadge">Available for new opportunities</span>'),
    (r'<span class="title-text" id="title-text">Full Stack Developer</span>', r'<span class="title-text" id="title-text" data-i18n="heroTitle">Full Stack Developer</span>'),
    (r'Solving complex problems with elegant code; building scalable SaaS platforms, automation systems, and end-to-end\s+digital solutions.', r'<span data-i18n="heroDesc">Solving complex problems with elegant code; building scalable SaaS platforms, automation systems, and end-to-end digital solutions.</span>'),
    (r'<span class="btn-text">View Projects</span>', r'<span class="btn-text" data-i18n="btnProjects">View Projects</span>'),
    (r'<span class="btn-text">Contact Me</span>', r'<span class="btn-text" data-i18n="btnContact">Contact Me</span>'),
    (r'<span class="eyebrow-text">About &amp; Expertise</span>', r'<span class="eyebrow-text" data-i18n="aboutEyebrow">About &amp; Expertise</span>'),
    (r'With a strong foundation in both software architecture and business processes', r'<span data-i18n="aboutP1">With a strong foundation in both software architecture and business processes</span>'),
    (r'This includes <strong>Hospital Information Management Systems \(HBYS\)</strong>', r'<span data-i18n="aboutP2">This includes <strong>Hospital Information Management Systems (HBYS)</strong>'),
    (r'My work sits at the intersection of software architecture, process automation,', r'<span data-i18n="aboutP3">My work sits at the intersection of software architecture, process automation,</span>'),
    (r'<h3 class="tech-section-heading" id="tech-heading">Tech Stack &amp; Toolbox</h3>', r'<h3 class="tech-section-heading" id="tech-heading" data-i18n="techHeading">Tech Stack &amp; Toolbox</h3>'),
    (r'<span class="eyebrow-text">Featured Work</span>', r'<span class="eyebrow-text" data-i18n="projEyebrow">Featured Work</span>'),
    (r'Projects that <span class="heading-accent">Ship</span>', r'<span data-i18n="projHeading">Projects that <span class="heading-accent">Ship</span></span>'),
    (r'<span class="eyebrow-text">Contact</span>', r'<span class="eyebrow-text" data-i18n="contactEyebrow">Contact</span>'),
    (r'Let\'s Build Something <span class="heading-accent">Great</span>', r'<span data-i18n="contactHeading">Let\'s Build Something <span class="heading-accent">Great</span></span>'),
    (r'<p class="footer-made">\s*Crafted with <span class="footer-heart" aria-label="love">¦</span> &amp; clean code.\s*</p>', r'<p class="footer-made" data-i18n="footerMade">Crafted with <span class="footer-heart" aria-label="love">¦</span> &amp; clean code.</p>')
]

for old, new in replacements:
    content = re.sub(old, new, content, count=1)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added basic data-i18n tags.")
