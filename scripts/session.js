import { userSection } from './fetch.js';
import { showModalAlert, openSession, exitSession } from './modals.js';
import { showModalInformation, showModalContact } from './info.js';
import {
  showModalDeleteUser,
  showModalLogoff,
  showModalUser,
} from '../ui/User.js';
import { showModalClient } from '../ui/Client.js';
import { modalListRequest, modalNewRequest } from '../ui/Request.js';
import { openListAddressClient } from '../ui/Address.js';

document.addEventListener('DOMContentLoaded', async function () {
  const session = localStorage.getItem('session');
  const sessionExpiration = localStorage.getItem('sessionExpiration');

  const userCheck = async () => {
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
      }
      if (window.innerWidth >= 1025) {
        if (session === 'Cliente') {
          document
            .querySelector('.data-client-desktop')
            .classList.remove('hidden');
          document
            .querySelector('.service-client-desktop')
            .classList.remove('hidden');
        } else if (session === 'Usuário') {
          document
            .querySelector('.data-client-desktop')
            .classList.add('hidden');
          document
            .querySelector('.service-client-desktop')
            .classList.add('hidden');
        } else {
          async () => {
            await exitSession();
          };
        }
      } else {
        if (session === 'Cliente') {
          document.querySelector('.data-client-btn').classList.remove('hidden');
          document
            .querySelector('.service-client-btn')
            .classList.remove('hidden');
          document.querySelector('.data-env-btn').classList.remove('hidden');
        } else if (session === 'Usuário') {
          document.querySelector('.data-client-btn').classList.add('hidden');
          document.querySelector('.service-client-btn').classList.add('hidden');
          document.querySelector('.data-env-btn').classList.add('hidden');
        } else {
          async () => {
            await exitSession();
          };
        }
      }
    } else {
      async () => {
        await exitSession();
      };
    }
  };

  await userCheck();

  const SESSION_TIME = 5 * 60 * 1000; // 5 minutos
  let sessionInterval;

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
      return; // Se não há tempo de expiração, não faz sentido mostrar o temporizador
    }

    const now = new Date();
    if (new Date(expiration) <= now) {
      await exitSession(); // Se o tempo já expirou, encerra a sessão
      return;
    }
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
    var(--color-main) ${progress}%, 
    var(--color-trans-2) ${progress}%
  )`;

    // Faz logout automático se o tempo acabar
    if (remainingTime <= 0) {
      document.getElementById('renew-session').classList.add('hidden');
      document.getElementById('exit-session').classList.add('hidden');
      userCheck();
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
    initializeSessionTimer();
  } else {
    async () => {
      await exitSession();
    };
  }

  renewButton.addEventListener('click', renewSession);

  document
    .getElementById('dataUser-desktop')
    .addEventListener('click', async () => {
      await showModalUser();
    });

  document
    .getElementById('dataUser-btn')
    .addEventListener('click', async () => {
      await showModalUser();
    });

  document
    .getElementById('deleteUser-desktop')
    .addEventListener('click', async () => {
      await showModalDeleteUser();
    });

  document
    .getElementById('deleteUser-btn')
    .addEventListener('click', async () => {
      await showModalDeleteUser();
    });

  document
    .getElementById('logout-desktop')
    .addEventListener('click', async () => {
      await showModalLogoff();
    });

  document.getElementById('logout-btn').addEventListener('click', async () => {
    await showModalLogoff();
  });

  document
    .getElementById('exit-session')
    .addEventListener('click', async () => {
      await showModalLogoff();
    });

  document
    .getElementById('exit-session')
    .addEventListener('click', async () => {
      await showModalLogoff();
    });

  document
    .getElementById('information-desktop')
    .addEventListener('click', async () => {
      await showModalInformation();
    });

  document
    .getElementById('information-btn')
    .addEventListener('click', async () => {
      await showModalInformation();
    });

  document
    .getElementById('contact-desktop')
    .addEventListener('click', async () => {
      await showModalContact();
    });

  document.getElementById('contact-btn').addEventListener('click', async () => {
    await showModalContact();
  });

  document
    .getElementById('client-desktop')
    .addEventListener('click', async () => {
      await showModalClient();
    });

  document.getElementById('client-btn').addEventListener('click', async () => {
    await showModalClient();
  });

  document
    .getElementById('service-desktop')
    .addEventListener('click', async () => {
      await modalNewRequest();
    });

  document.getElementById('service-btn').addEventListener('click', async () => {
    await modalNewRequest();
  });

  document
    .getElementById('request-desktop')
    .addEventListener('click', async () => {
      await modalListRequest();
    });

  document.getElementById('request-btn').addEventListener('click', async () => {
    await modalListRequest();
  });

  document
    .getElementById('environment-desktop')
    .addEventListener('click', async () => {
      await openListAddressClient();
    });

  document
    .getElementById('environment-btn')
    .addEventListener('click', async () => {
      await openListAddressClient();
    });
});
