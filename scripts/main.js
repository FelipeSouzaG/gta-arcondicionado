import {
  closeModal,
  exitSession,
  openSession,
  showModalAlert,
} from './modals.js';
import { userSection } from './services.js';

document.addEventListener('DOMContentLoaded', async function () {
  const session = localStorage.getItem('session');
  const sessionExpiration = localStorage.getItem('sessionExpiration');
  const userStatus = async () => {
    if (session) {
      if (sessionExpiration && new Date() > new Date(sessionExpiration)) {
        showModalAlert(
          'Next',
          'Sessão expirada!',
          'Por favor, faça login novamente.',
          async () => {
            await exitSession();
          }
        );
        return;
      }
      if (window.innerWidth >= 1025) {
        if (session === 'Cliente') {
          document.querySelector('.enter-desktop').classList.add('hidden');
          document
            .querySelector('.data-user-desktop')
            .classList.remove('hidden');
          document
            .querySelector('.data-service-desktop')
            .classList.remove('hidden');
          document
            .querySelector('.client-service-desktop')
            .classList.remove('hidden');
          document
            .querySelector('.data-client-desktop')
            .classList.remove('hidden');
        }

        if (session === 'Usuário') {
          document.querySelector('.enter-desktop').classList.add('hidden');
          document
            .querySelector('.data-user-desktop')
            .classList.remove('hidden');
          document
            .querySelector('.data-service-desktop')
            .classList.remove('hidden');
        }
      } else {
        if (session === 'Cliente') {
          document.querySelector('.enter-mobile').classList.add('hidden');
          document
            .querySelector('.data-user-mobile')
            .classList.remove('hidden');
          document
            .querySelector('.data-service-mobile')
            .classList.remove('hidden');
          document
            .querySelector('.client-service-mobile')
            .classList.remove('hidden');
          document
            .querySelector('.data-client-mobile')
            .classList.remove('hidden');
        }

        if (session === 'Usuário') {
          document.querySelector('.enter-mobile').classList.add('hidden');
          document
            .querySelector('.data-user-mobile')
            .classList.remove('hidden');
          document
            .querySelector('.data-service-mobile')
            .classList.remove('hidden');
        }
      }
    }
  };

  userStatus();

  //////////////////////////////////////////////////////

  // Configuração inicial
  const SESSION_TIME = 5 * 60 * 1000; // 5 minutos
  let sessionInterval;

  const sessionEnter = document.getElementById('session-enter');
  const sessionTimer = document.getElementById('session-timer');
  const progressCircle = document.getElementById('progress-circle');
  const renewButton = document.getElementById('renew-session');

  // Verifica se o usuário está logado (session presente)
  function isUserLoggedIn() {
    return localStorage.getItem('session') !== null;
  }

  // Inicializa o temporizador
  async function initializeSessionTimer() {
    const expiration = localStorage.getItem('sessionExpiration');

    if (!expiration) {
      sessionEnter.style.display = 'flex';
      return; // Se não há tempo de expiração, não faz sentido mostrar o temporizador
    }

    const now = new Date();
    if (new Date(expiration) <= now) {
      await exitSession(); // Se o tempo já expirou, encerra a sessão
      return;
    }
    sessionEnter.style.display = 'none';
    sessionTimer.style.display = 'flex'; // Exibe o botão
    updateTimer(); // Atualiza o progresso visual imediatamente

    // Inicia o intervalo para atualização do timer
    sessionInterval = setInterval(updateTimer, 1000);
  }

  // Atualiza o progresso do timer
  async function updateTimer() {
    const expiration = new Date(localStorage.getItem('sessionExpiration'));
    const now = new Date();
    const remainingTime = expiration - now;

    // Atualiza o progresso visual
    const progress = Math.max((remainingTime / SESSION_TIME) * 100, 0);
    progressCircle.style.background = `linear-gradient(to top, 
    var(--color-2) ${progress}%, 
    var(--color-trans-2) ${progress}%
  )`;

    // Faz logout automático se o tempo acabar
    if (remainingTime <= 0) {
      document.getElementById('renew-session').classList.add('hidden');
      document.getElementById('exit-session').classList.add('hidden');
      userStatus();
    }
  }

  // Renova a sessão ao clicar no botão
  async function renewSession() {
    try {
      const response = await userSection();
      if (response.status === 200) {
        const level = response.level; // Supõe que a resposta contém o nível
        await openSession(level); // Renova o tempo da sessão
        updateTimer();
      } else if (response.status === 401) {
        await exitSession();
      }
    } catch (error) {
      console.error('Erro de conexão ao renovar sessão:', error);
    }
  }

  // Verifica o estado do usuário e inicializa o botão
  if (isUserLoggedIn()) {
    sessionEnter.style.display = 'none';
    initializeSessionTimer();
  } else {
    sessionTimer.style.display = 'none'; // Oculta o botão se o usuário não estiver logado
    sessionEnter.style.display = 'flex';
  }

  // Adiciona o evento de clique ao botão de renovação
  renewButton.addEventListener('click', renewSession);

  /////////////////////////////////////////////////////

  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('menu');
  const submenuButtons = document.querySelectorAll('.submenu-btn');
  const toggleButtons = document.querySelectorAll('.toggle-button');
  const mainSections = document.querySelectorAll('.section-content');
  const bannerSection = document.querySelector('.banner');
  const labels = document.querySelectorAll('label[for]');

  function closeAllSubmenus() {
    const submenus = document.querySelectorAll('.submenu');
    submenus.forEach((submenu) => {
      submenu.parentElement.classList.remove('open');
      const icon = submenu.previousElementSibling.querySelector('.icon');
      if (icon) {
        icon.textContent = '+';
      }
    });
  }

  hamburger.addEventListener('click', () => {
    if (menu.classList.contains('show')) {
      closeAllSubmenus();
    }
    menu.classList.toggle('show');
  });

  submenuButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const parentItem = button.parentElement;
      const icon = button.querySelector('.icon');
      const isOpen = parentItem.classList.contains('open');

      closeAllSubmenus();

      if (!isOpen) {
        parentItem.classList.add('open');
        icon.textContent = '-';
      } else {
        parentItem.classList.remove('open');
        icon.textContent = '+';
      }
    });
  });

  document.addEventListener('click', (event) => {
    if (
      !menu.contains(event.target) &&
      !hamburger.contains(event.target) &&
      menu.classList.contains('show')
    ) {
      closeAllSubmenus();
      menu.classList.remove('show');
    }
  });

  const isAnyOpen = () =>
    Array.from(mainSections).some((section) =>
      section.querySelector('.section-main').classList.contains('open')
    );

  bannerSection.style.height = 'auto';

  const closeAllSections = () => {
    mainSections.forEach((section) => {
      const main = section.querySelector('.section-main');
      main.style.height = '0';
      main.classList.remove('open');
      section.querySelector('.toggle-button').textContent = '+';
    });

    bannerSection.style.height = 'auto';
    const tempHeight = bannerSection.scrollHeight;
    bannerSection.style.height = `${tempHeight}px`;
    setTimeout(() => (bannerSection.style.height = 'auto'), 300);
  };

  toggleButtons.forEach((button) => {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      if (menu.classList.contains('show')) {
        closeAllSubmenus();
        menu.classList.toggle('show');
      }
      const currentSection = this.closest('.section-content');
      const sectionMain = currentSection.querySelector('.section-main');
      mainSections.forEach((section) => {
        const main = section.querySelector('.section-main');
        if (section !== currentSection) {
          main.style.height = '0';
          main.classList.remove('open');
          section.querySelector('.toggle-button').textContent = '+';
        }
      });
      if (sectionMain.classList.contains('open')) {
        sectionMain.classList.remove('open');
        this.textContent = '+';
        sectionMain.style.height = '0';
      } else {
        sectionMain.classList.add('open');
        this.textContent = '-';
        sectionMain.style.height = sectionMain.scrollHeight + 'px';
      }
      if (isAnyOpen()) {
        bannerSection.style.height = '0';
      }
    });
  });

  labels.forEach((label) => {
    label.addEventListener('click', function (event) {
      event.preventDefault();
      const buttonId = this.getAttribute('for');
      const correspondingButton = document.getElementById(buttonId);

      if (correspondingButton) {
        correspondingButton.click();
      }
    });
  });

  document.addEventListener('click', (event) => {
    const isToggleButton = event.target.classList.contains('toggle-button');
    const isLabel = event.target.tagName === 'LABEL';
    if (!isToggleButton && !isLabel) {
      closeAllSections();
    }
  });

  const informations = document.getElementById('showInformation');
  informations.addEventListener('click', () => {
    showModalInformation();
  });

  const contact = document.getElementById('showContact');
  contact.addEventListener('click', () => {
    showModalContact();
  });
});

function showModalInformation() {
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

function showModalContact() {
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
          <div class="icon-contact contact-phone">       
            <span>(31)98476-8112</span>
            <img src="./img/watts.png">
          </div>
          <div class="icon-contact contact-phone">       
            <span>(31)3385-5549</span>
            <img src="./img/phone.png">
          </div>                    
          <h2>Email:</h2>
          <div class="icon-contact contact-mail">           
            <span>ar.comercialgta@gmail.com</span>
            <img src="./img/gmail.png">
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

/* produtos

  let products = [];

  const loadProducts = async () => {
    try {
      const dataProducts = await publicProducts();

      products = dataProducts.data;

      displayProducts(products);

      localStorage.setItem('products', JSON.stringify(products));
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const displayProducts = (products) => {
    const container = document.querySelector('.products-container');
    container.innerHTML = products
      .map((product) => {
        return `
        <div class="card" data-product-id="${product._id}" data-product-name="${
          product.name
        }">
          <div class="carousel">
            ${getImageCarousel(product.images)}
          </div>
          <h3>${product.name}</h3>
          <div class="card-text">
            <p>${product.type} ${product.brand} ${product.model} ${
          product.color
        }</p>
          </div>
          <div class="detals">
            <span class="detals-price">R$ ${parseFloat(product.price)
              .toFixed(2)
              .replace('.', ',')}</span>
            <button class="detals-btn" data-action="detals">Detalhes</button>
          </div>
          <div class="requestService">
            <button class="btn-cart" data-action="remove">-</button>
            <span><button class="btn-order" data-action="create-order">Comprar</button></span>
            <button class="btn-cart" data-action="add">+</button>
          </div>
        </div>
      `;
      })
      .join('');

    initializeCarousels();

    document
      .querySelectorAll(".detals-btn[data-action='detals']")
      .forEach((button) => {
        button.addEventListener('click', () => {
          const productId = button
            .closest('.card')
            .getAttribute('data-product-id');
          showModalProduct(productId);
        });
      });

    document
      .querySelectorAll(".btn-request[data-action='create-request']")
      .forEach((button) => {
        button.addEventListener('click', async () => {
          const productId = button
            .closest('.card')
            .getAttribute('data-product-id');
          await addToCartPurchase(productId); // acionar função de comprar produto
        });
      });
  };

  const getImageCarousel = (images) => {
    if (!images || images.length === 0) {
      return `<img src="https://via.placeholder.com/200x200" alt="Placeholder Image" class="carousel-image active">`;
    }

    const imageElements = images
      .map(
        (image, index) => `
      <img src="${
        typeof image === 'object' ? Object.values(image).join('') : image
      }" alt="Image ${index + 1}" class="carousel-image ${
          index === 0 ? 'active' : ''
        }">
    `
      )
      .join('');

    const indicators = images
      .map(
        (_, index) => `
      <span class="indicator ${index === 0 ? 'active' : ''}"></span>
    `
      )
      .join('');

    return `
      <div class="carousel-container">
        ${imageElements}
      </div>
      <button class="carousel-button prev">❮</button>
      <button class="carousel-button next">❯</button>
      <div class="carousel-indicators">
        ${indicators} 
      </div>
    `;
  };

  const initializeCarousels = () => {
    const carousels = document.querySelectorAll('.carousel-container');

    carousels.forEach((carousel) => {
      const images = carousel.querySelectorAll('.carousel-image');
      const indicators = carousel.parentNode.querySelectorAll('.indicator');
      let currentIndex = 0;
      const imageInterval = 5000;

      const showImage = (index) => {
        if (index >= images.length) {
          currentIndex = 0;
        } else if (index < 0) {
          currentIndex = images.length - 1;
        } else {
          currentIndex = index;
        }

        const offset = -currentIndex * 100;
        images.forEach((slide) => {
          slide.style.transform = `translateX(${offset}%)`;
        });

        indicators.forEach((indicator, idx) => {
          indicator.classList.toggle('active', idx === currentIndex);
        });
      };

      const prevButton = carousel.parentNode.querySelector(
        '.carousel-button.prev'
      );
      const nextButton = carousel.parentNode.querySelector(
        '.carousel-button.next'
      );

      prevButton.addEventListener('click', () => showImage(currentIndex - 1));
      nextButton.addEventListener('click', () => showImage(currentIndex + 1));

      indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => showImage(index));
      });

      setInterval(() => showImage(currentIndex + 1), imageInterval);
    });
  };

  loadProducts();

  function showModalProduct(productId) {
    const product = products.find((p) => p._id === productId);

    if (!product) {
      console.error('Produto não encontrado');
      return;
    }

    const modal = document.getElementById('modal-details');
    const title = document.getElementById('modal-details-title');
    const content = document.getElementById('modal-details-main');
    const btnClose = document.getElementById('close-details');
    const footer = document.getElementById('modal-details-footer');

    title.textContent = '';
    content.innerHTML = '';
    footer.innerHTML = '';
    title.textContent = `Detalhes do Produto`;

    content.innerHTML = `<span class='title-details'>${product.name}</span>`;
    content.classList.add('details-table');

    const table = document.createElement('table');
    table.className = 'details-table';

    for (let i = 0; i < product.details.length; i += 2) {
      const row = document.createElement('tr');

      const propertyCell = document.createElement('td');
      propertyCell.textContent = product.details[i];

      const valueCell = document.createElement('td');
      valueCell.textContent = product.details[i + 1];

      row.appendChild(propertyCell);
      row.appendChild(valueCell);
      table.appendChild(row);
    }

    content.appendChild(table);

    footer.innerHTML = `
      <button id="modalBtnOkDetail" class="ok">Fechar</button>
    `;

    btnClose.onclick = function () {
      modal.style.display = 'none';
    };

    modal.style.display = 'block';

    const exit = document.getElementById('modalBtnOkDetail');
    exit.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    btnClose.focus();
    btnClose.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }*/
