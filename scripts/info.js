import { infoMail, infoPhone, infoWattsApp } from './icons.js';

export async function showModalInformation() {
  const modal = document.getElementById('modal-information');
  const title = document.getElementById('modal-information-title');
  const content = document.getElementById('modal-information-main');
  const btnClose = document.getElementById('close-information');
  const exit = document.getElementById('exit-information');

  title.textContent = '';
  content.innerHTML = `
      <div class="contact-card">
        <div class="information">
          <h2>Sobre:</h2>
          <p>A GTA Ar Condicionado surgiu com o objetivo de oferecer serviços de instalação e manutenção de ar-condicionado e refrigeradores, garantindo conforto e eficiência para residências, comércios e indústrias. Começando com projetos residenciais, rapidamente expandiu sua atuação para ambientes comerciais e industriais, consolidando-se pela qualidade e compromisso.
            Especializada em instalação de sistemas split, central e VRF, a GTA se destaca na manutenção preventiva e corretiva, com profissionais capacitados e atualizados. Além disso, adota práticas sustentáveis, recomendando equipamentos eficientes e realizando descarte ambientalmente adequado.
            Com parcerias estratégicas e atendimento personalizado, a GTA se tornou referência no mercado, sempre buscando soluções inovadoras e mantendo sua missão de proporcionar conforto e segurança a seus clientes.</p>
          </p>
          <h2>Política do Site – GTA Ar Condicionado:</h2>
          <p>
            Bem-vindo ao site da GTA Ar Condicionado! Para garantir uma navegação segura, transparente e alinhada com nossos valores, apresentamos abaixo as diretrizes da nossa política:
          </p>
          <h3>1. Uso do Conteúdo:</h3>
          <p>
            Todo o conteúdo disponível no site – textos, imagens, logotipos e materiais informativos – é de propriedade da GTA Ar Condicionado. É proibida a reprodução, distribuição ou uso sem autorização prévia.
          </p>
          <h3>2. Privacidade e Segurança:</h3>
          <p>
            Coletamos dados pessoais apenas para fins de atendimento e melhoria dos nossos serviços, como solicitações de orçamento e contato. Garantimos que suas informações serão tratadas de forma confidencial e não serão compartilhadas com terceiros sem seu consentimento.
          </p>
          <h3>3. Cookie:</h3>
          <p>
            Utilizamos cookies para otimizar sua experiência de navegação. Você pode ajustar as configurações de cookies no seu navegador a qualquer momento.
          </p>
          <h3>4. Links Externos:</h3>
          <p>
            Nosso site pode conter links para sites de terceiros. Não nos responsabilizamos por conteúdo ou práticas de privacidade de outros sites e recomendamos que você leia suas políticas antes de utilizar esses serviços.
          </p>
          <h3>5. Alterações na Política:</h3>
          <p>
            A GTA Ar Condicionado se reserva o direito de atualizar esta política a qualquer momento para se adequar a novas práticas ou legislações. As alterações serão publicadas no site e entrarão em vigor imediatamente.
          </p>
          <h3>6. Contato:</h3>
          <p>
            Em caso de dúvidas ou solicitações sobre esta política, entre em contato conosco por meio dos canais disponíveis no site.
          </p>
          <p>
            A GTA Ar Condicionado agradece sua visita e reforça seu compromisso com a transparência, a segurança e a excelência no atendimento!
          </p>
        </div>             
      </div>
    `;

  modal.style.display = 'block';

  btnClose.onclick = function () {
    modal.style.display = 'none';
  };

  exit.onclick = function () {
    modal.style.display = 'none';
  };
}

export async function showModalContact() {
  const modal = document.getElementById('modal-information');
  const title = document.getElementById('modal-information-title');
  const content = document.getElementById('modal-information-main');
  const btnClose = document.getElementById('close-information');
  const exit = document.getElementById('exit-information');

  title.textContent = '';
  content.innerHTML = `
    <div class="contact-card">
      <div class="contact">
        <h2>Técnico Responsável:</h2>
        <p>Thiago Antônio</p>
        <h2>Telefones</h2>
        <div class="icon-contact">       
          <span>(31)98476-8112</span>
          <a href="https://wa.me/5531995454632?text=Gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20os%20Servi%C3%A7os%20da%20GTA%20Ar%20Condicionados." target="_blank">
            ${infoWattsApp}
          </a>
        </div>
        <div class="icon-contact">       
          <span>(31)3385-5549</span>
          <a href="tel:+5531995454632">
            ${infoPhone}
          </a>
        </div>                    
        <h2>Email:</h2>
        <div class="icon-contact">           
          <span>ar.comercialgta@gmail.com</span>
          <a href="mailto:ar.comercialgta@gmail.com?subject=Solicitação%20de%20Orçamento&body=Olá,%20gostaria%20de%20mais%20informações%20sobre%20os%20serviços.">
            ${infoMail}
          </a>
        </div>
      </div>             
    </div>
  `;

  modal.style.display = 'block';

  btnClose.onclick = function () {
    modal.style.display = 'none';
  };

  exit.onclick = function () {
    modal.style.display = 'none';
  };
}
