document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. PERSISTÊNCIA DAS PREFERÊNCIAS DE ACESSIBILIDADE VIA LOCALSTORAGE
     ========================================================================== */
  const body = document.body;
  const html = document.documentElement;

  // Botões
  const btnFonteMenos = document.getElementById('btn-fonte-menos');
  const btnFonteReset = document.getElementById('btn-fonte-reset');
  const btnFonteMais = document.getElementById('btn-fonte-mais');
  const btnEspacamento = document.getElementById('btn-espacamento');
  const btnDislexia = document.getElementById('btn-dislexia');
  const btnContraste = document.getElementById('btn-contraste');

  // Estado inicial do tamanho da fonte (porcentagem base: 106.25% = 17px)
  let percentualFonteAtual = parseInt(localStorage.getItem('pref-fonte-size')) || 100;

  function aplicarTamanhoFonte(percentual) {
    percentualFonteAtual = Math.min(Math.max(percentual, 90), 150);
    html.style.fontSize = `${(106.25 * percentualFonteAtual) / 100}%`;
    localStorage.setItem('pref-fonte-size', percentualFonteAtual);
  }

  btnFonteMenos.addEventListener('click', () => aplicarTamanhoFonte(percentualFonteAtual - 10));
  btnFonteMais.addEventListener('click', () => aplicarTamanhoFonte(percentualFonteAtual + 10));
  btnFonteReset.addEventListener('click', () => aplicarTamanhoFonte(100));

  // Função genérica de Toggle com Aaria-Pressed e LocalStorage
  function configurarTogglePref(botao, classeCSS, chaveStorage) {
    const estadoSalvo = localStorage.getItem(chaveStorage) === 'true';

    if (estadoSalvo) {
      body.classList.add(classeCSS);
      botao.setAttribute('aria-pressed', 'true');
    }

    botao.addEventListener('click', () => {
      const estaAtivo = body.classList.toggle(classeCSS);
      botao.setAttribute('aria-pressed', estaAtivo ? 'true' : 'false');
      localStorage.setItem(chaveStorage, estaAtivo);
    });
  }

  configurarTogglePref(btnEspacamento, 'espacamento-ampliado', 'pref-espacamento');
  configurarTogglePref(btnDislexia, 'fonte-dislexia', 'pref-dislexia');
  configurarTogglePref(btnContraste, 'alto-contraste', 'pref-contraste');

  // Reaplica tamanho salvo imediatamente
  aplicarTamanhoFonte(percentualFonteAtual);

  /* ==========================================================================
     2. NAVEGAÇÃO E DROPDOWNS DO MENU
     ========================================================================== */
  const dropdowns = document.querySelectorAll('.dropdown');

  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const aberto = dropdown.classList.contains('aberto');

      // Fecha outros dropdowns
      dropdowns.forEach(d => {
        d.classList.remove('aberto');
        d.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
      });

      if (!aberto) {
        dropdown.classList.add('aberto');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Fecha dropdowns ao clicar fora ou teclar Esc
  document.addEventListener('click', () => {
    dropdowns.forEach(d => {
      d.classList.remove('aberto');
      d.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdowns.forEach(d => {
        d.classList.remove('aberto');
        d.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
      });
    }
  });

  /* ==========================================================================
     3. MENU MOBILE HAMBÚRGUER
     ========================================================================== */
  const btnMenuMobile = document.getElementById('btn-menu-mobile');
  const menuPrincipal = document.getElementById('menu-principal');

  btnMenuMobile.addEventListener('click', () => {
    const expandido = btnMenuMobile.getAttribute('aria-expanded') === 'true';
    btnMenuMobile.setAttribute('aria-expanded', !expandido);
    menuPrincipal.classList.toggle('aberto');
  });

  /* ==========================================================================
     4. SCROLL-SPY COM INTERSECTIONOBSERVER
     ========================================================================== */
  const secoes = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  // Guarda qual seção está ativa no momento, usada também pelo modo Autodescrição
  let secaoAtivaId = secoes.length ? secoes[0].getAttribute('id') : null;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idAtivo = entry.target.getAttribute('id');

        // Se a leitura em voz alta estiver ativa e o usuário mudar de seção,
        // interrompe para não continuar narrando um trecho que saiu de foco
        if (idAtivo !== secaoAtivaId && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }

        secaoAtivaId = idAtivo;

        navLinks.forEach(link => {
          const href = link.getAttribute('href').replace('#', '');
          if (href === idAtivo) {
            link.setAttribute('aria-current', 'true');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      }
    });
  }, observerOptions);

  secoes.forEach(secao => observer.observe(secao));

  /* ==========================================================================
     5. MODO AUTODESCRIÇÃO (LEITURA EM VOZ ALTA DA SEÇÃO ATUAL)
     ========================================================================== */
  const btnAutodescricao = document.getElementById('btn-autodescricao');

  if (btnAutodescricao) {
    if (!('speechSynthesis' in window)) {
      // Navegador sem suporte à Web Speech API: oculta o botão em vez de oferecer algo quebrado
      btnAutodescricao.hidden = true;
    } else {
      const textoAutodescricao = btnAutodescricao.querySelector('.texto-autodescricao');
      const ROTULO_OUVIR = 'Ouvir Seção';
      const ROTULO_PARAR = 'Parar Leitura';

      function pararLeitura() {
        window.speechSynthesis.cancel();
        btnAutodescricao.setAttribute('aria-pressed', 'false');
        btnAutodescricao.setAttribute('aria-label', 'Ouvir a seção atual em voz alta');
        btnAutodescricao.classList.remove('lendo');
        if (textoAutodescricao) textoAutodescricao.textContent = ROTULO_OUVIR;
      }

      btnAutodescricao.addEventListener('click', () => {
        // Se já está lendo, o clique funciona como "parar"
        if (window.speechSynthesis.speaking) {
          pararLeitura();
          return;
        }

        const secaoAtual = secaoAtivaId ? document.getElementById(secaoAtivaId) : null;
        if (!secaoAtual) return;

        const texto = secaoAtual.innerText.replace(/\s+/g, ' ').trim();
        if (!texto) return;

        // Garante que não haja fala anterior enfileirada antes de começar
        window.speechSynthesis.cancel();

        const fala = new SpeechSynthesisUtterance(texto);
        fala.lang = 'pt-BR';

        fala.addEventListener('end', pararLeitura);
        fala.addEventListener('error', pararLeitura);

        window.speechSynthesis.speak(fala);
        btnAutodescricao.setAttribute('aria-pressed', 'true');
        btnAutodescricao.setAttribute('aria-label', 'Parar a leitura em voz alta');
        btnAutodescricao.classList.add('lendo');
        if (textoAutodescricao) textoAutodescricao.textContent = ROTULO_PARAR;
      });

      // Interrompe a leitura se a pessoa sair da página/aba
      window.addEventListener('beforeunload', () => window.speechSynthesis.cancel());
    }
  }
});