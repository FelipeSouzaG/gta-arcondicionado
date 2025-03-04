import { showModalLogin, showModalRegister } from '../ui/User.js';
import { showModalContact, showModalInformation } from './info.js';
import { closeModalRegister, showModalAlert } from './modals.js';
import { environmentAllServices } from './fetch.js';

function enableFullScreen() {
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  } else if (document.documentElement.webkitRequestFullscreen) {
    document.documentElement.webkitRequestFullscreen();
  } else if (document.documentElement.msRequestFullscreen) {
    document.documentElement.msRequestFullscreen();
  }
}

document.addEventListener('DOMContentLoaded', async function () {
  enableFullScreen();
  document.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      enableFullScreen();
    }
  });
  
  const toggleButtons = document.querySelectorAll('.toggle-button');
  const mainSections = document.querySelectorAll('.section-content');
  const bannerSection = document.querySelector('.banner');
  const labels = document.querySelectorAll('label[for]');

  let bannerGta;

  if (window.innerWidth >= 1025) {
    bannerGta = document.querySelector('.banner-gta');
  } else {
    bannerGta = null;
  }

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
    if (bannerGta) {
      bannerGta.style.display = 'block';
    }
  };

  toggleButtons.forEach((button) => {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
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
        if (bannerGta) {
          bannerGta.style.display = 'block';
        }
      } else {
        sectionMain.classList.add('open');
        this.textContent = '-';
        sectionMain.style.height = sectionMain.scrollHeight + 'px';
      }
      if (isAnyOpen()) {
        bannerSection.style.height = '0';
        if (bannerGta) {
          bannerGta.style.display = 'none';
        }
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

  function createSnowflakes() {
    const banner = document.getElementById('banner1');
    for (let i = 0; i < 30; i++) {
      const snowflake = document.createElement('div');
      snowflake.className = 'snowflake';
      snowflake.style.left = `${Math.random() * 100}%`;
      snowflake.style.animationDuration = `${3 + Math.random() * 5}s`;
      banner.appendChild(snowflake);

      setTimeout(() => {
        snowflake.remove();
      }, 8000);
    }
  }

  setInterval(createSnowflakes, 1000);

  const urlParams = new URLSearchParams(window.location.search);
  const envId = urlParams.get('envId');
  const equipmentName = urlParams.get('equipmentName');

  if (envId && equipmentName) {
    await openServices(envId, equipmentName);
  }

  async function openServices(envId, equipmentName) {
    let servicesData = [];
    try {
      const serviceList = await environmentAllServices(envId);
      if (serviceList.status === 200) {
        servicesData = [...serviceList.historys];
      } else {
        showModalAlert('Next', serviceList.title, serviceList.msg, async () => {
          closeModalRegister();
        });
      }
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      showModalAlert('Next', 'Erro de Conexão!', error.message, async () => {
        closeModalRegister();
      });
    }

    if (servicesData.length === 0) {
      showModalAlert(
        'Next',
        'Não há Serviços!',
        'Não há histórico de Serviços executados para este equipamento',
        async () => {
          closeModalRegister();
        }
      );
    }

    const maintenance = servicesData.filter(
      (service) => service.serviceType === 'Manutenção'
    );

    const servicesTableRows = generateServiceTableRows(servicesData);
    function generateServiceTableRows(services) {
      let table = '';

      services.forEach((d) => {
        table += `<tr><td colspan="2"><strong>Data:</strong> ${new Date(
          d.date
        ).toLocaleString()}</td></tr>`;

        d.maintenance.forEach((m) => {
          table += `
            <tr>
              <td><strong>Serviço:</strong></td>
              <td>${m.service}</td>
            </tr>
          `;
        });
      });

      return table;
    }

    const modal = document.getElementById('modal-register');
    const title = document.getElementById('modal-register-title');
    const content = document.getElementById('modal-register-main');
    const footer = document.getElementById('modal-register-footer');
    const btnClose = document.getElementById('close-register');

    title.textContent = 'Histórico de Serviços';

    content.innerHTML = `
      <table class="details-table">
        <thead>
          <tr>
            <th colspan="2" style="text-align: center;">
              Equipamento ${equipmentName}
            </th>
          </tr>
        </thead>
        <tbody>
         ${servicesTableRows}
        </tbody>
      </table>
    `;

    footer.innerHTML = `
      <div class="modal-user-footer">
        
      </div>
    `;

    modal.style.display = 'block';

    btnClose.onclick = async function () {
      closeModalRegister();
    };
  }

  document
    .getElementById('loginDesktop')
    .addEventListener('click', async () => {
      await showModalLogin();
    });

  document
    .getElementById('registerDesktop')
    .addEventListener('click', async () => {
      await showModalRegister();
    });

  document
    .getElementById('enter-mobile')
    .addEventListener('click', async () => {
      await showModalLogin();
    });

  document
    .getElementById('enter-session')
    .addEventListener('click', async () => {
      await showModalLogin();
    });

  document
    .getElementById('registerSection')
    .addEventListener('click', async () => {
      await showModalRegister();
    });

  document
    .getElementById('showInformation')
    .addEventListener('click', async () => {
      await showModalInformation();
    });

  document.getElementById('showContact').addEventListener('click', async () => {
    await showModalContact();
  });
});
