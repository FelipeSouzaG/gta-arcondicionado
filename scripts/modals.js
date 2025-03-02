import { modalNewRequest } from '../ui/Request.js';
import { userLogoff } from './fetch.js';

export function showModalAlert(buttonType, title, message, onConfirm) {
  const modal = document.getElementById('modal');
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalMessage').textContent = message;
  const okButton = document.getElementById('modalBtnOk');
  const cancelButton = document.getElementById('modalBtnCancel');

  if (buttonType === 'Confirm') {
    okButton.style.display = 'block';
    okButton.textContent = 'Sim';
    cancelButton.style.display = 'block';
    cancelButton.textContent = 'Não';
  } else if (buttonType === 'Alert') {
    okButton.style.display = 'none';
    cancelButton.style.display = 'block';
    cancelButton.textContent = 'OK';
    cancelButton.classList.remove('modal-content-btn-cancel');
    cancelButton.classList.add('modal-content-btn-ok');
  } else if (buttonType === 'Next') {
    okButton.style.display = 'block';
    cancelButton.style.display = 'none';
    okButton.textContent = 'OK';
  }

  okButton.onclick = function () {
    onConfirm();
    closeModal();
  };

  cancelButton.onclick = function () {
    closeModal();
  };

  modal.style.display = 'block';
}

export function closeModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
}

export function closeModalRegister() {
  const modal = document.getElementById('modal-register');
  modal.style.display = 'none';
}

export function closeModalDetails() {
  const modal = document.getElementById('modal-details');
  modal.style.display = 'none';
}

export async function exitSession() {
  localStorage.removeItem('returnModal');
  localStorage.removeItem('session');
  localStorage.removeItem('sessionExpiration');
  await userLogoff();
  window.location.href = './index.html';
}

export async function openSession(level) {
  localStorage.setItem('session', level);
  const expirationTime = new Date(new Date().getTime() + 5 * 60 * 1000);
  localStorage.setItem('sessionExpiration', expirationTime.toISOString());
}

export async function returnModal() {
  const returnData = localStorage.getItem('returnModal');

  if (returnData) {
    const { type, data } = JSON.parse(returnData);

    switch (type) {
      case 'newRequest':
        await modalNewRequest();
        break;

      default:
        console.error('Tipo de retorno desconhecido:', type);
    }

    localStorage.removeItem('returnModal');
  }
}
