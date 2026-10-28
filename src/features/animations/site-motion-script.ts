/**
 * Script embutido nas páginas de site renderizadas no servidor (pré-visualização
 * e demonstrações). Antes da primeira pintura, marca <html> com "cws-js" para
 * que elementos com [data-reveal] comecem ocultos e sejam revelados pelo GSAP.
 *
 * Segurança e acessibilidade:
 * - Não marca nada se o usuário prefere movimento reduzido.
 * - Se o JavaScript não inicializar em 3,5 s, remove a marca e mostra tudo.
 */
export const SITE_MOTION_SCRIPT = `(function(){try{var d=document.documentElement;if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.classList.add('cws-js');setTimeout(function(){if(!window.__cwsReady)d.classList.remove('cws-js')},3500)}catch(e){}})();`;
