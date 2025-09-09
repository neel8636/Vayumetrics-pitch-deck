<!-- ==========================
3) app.js
========================== -->
<script id="inline-js">
(function(){
const byId = (id)=>document.getElementById(id);
const menuBtn = byId('menuBtn');
const nav = byId('navLinks');
const year = byId('year');
if(year) year.textContent = new Date().getFullYear();


function toggle(){
const open = nav.classList.toggle('open');
menuBtn.setAttribute('aria-expanded', String(open));
}
menuBtn.addEventListener('click', toggle);


// close menu on link click (mobile)
nav.addEventListener('click', (e)=>{
const t = e.target; if(t && t.tagName === 'A' && nav.classList.contains('open')) toggle();
});


// smooth scroll offset for sticky header
const header = document.querySelector('header.nav');
function scrollToHash(){
if(location.hash){
const el = document.querySelector(location.hash);
if(el){
const y = el.getBoundingClientRect().top + window.scrollY - (header?.offsetHeight || 0) - 8;
window.scrollTo({ top: y, behavior: 'smooth' });
}
}
}
window.addEventListener('hashchange', scrollToHash);
// if landing with an initial hash
if(location.hash) setTimeout(scrollToHash, 50);
})();
</script>