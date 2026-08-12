# Capacitismo na Prática — Front-End Specification

Este repositório contém a especificação front-end completa de um site educacional de página única sobre a conscientização, identificação e combate ao capacitismo, desenvolvido em **HTML5**, **CSS3** e **JavaScript puro** (vanilla).

## 🚀 Como Executar o Projeto Localmente
1. Clone ou faça o download deste repositório.
2. Certifique-se de salvar a logo fornecida no caminho `assets/img/logo.png`.
3. Abra o arquivo `index.html` em qualquer navegador web atualizado. Não é necessário nenhum servidor de build ou dependência Node.js.

## 🖼️ Como Substituir os Placeholders de Imagem por Imagens Reais
Em cada seção onde uma imagem ilustrativa é esperada, foi incluído um bloco padronizado `<figure class="img-placeholder" data-slot="...">`.

Para trocar por uma imagem real:
1. Adicione a nova imagem na pasta `assets/img/`.
2. Substitua a `div.img-placeholder-box` por uma tag `<img>` no HTML correspondente.
3. Exemplo:

```html
<!-- ANTES (Placeholder): -->
<figure class="img-placeholder" data-slot="hero-banner">
  <div class="img-placeholder-box" role="img" aria-label="...">...</div>
  <figcaption>Legenda...</figcaption>
</figure>

<!-- DEPOIS (Imagem Real): -->
<figure class="img-placeholder" data-slot="hero-banner">
  <img src="assets/img/hero-banner.jpg" alt="Descrição detalhada e acessível da imagem aqui" class="img-responsiva">
  <figcaption>Legenda descritiva da imagem.</figcaption>
</figure>