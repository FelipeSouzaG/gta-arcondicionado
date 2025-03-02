import { formGroupPort } from '../scripts/icons.js';
import {
  closeModal,
  closeModalRegister,
  exitSession,
  openSession,
  showModalAlert,
} from '../scripts/modals.js';
import { registerRequest } from '../scripts/fetch.js';

export async function modalNewRequestAddress(address) {
  const modal = document.getElementById('modal-register');
  const title = document.getElementById('modal-register-title');
  const content = document.getElementById('modal-register-main');
  const footer = document.getElementById('modal-register-footer');
  const btnClose = document.getElementById('close-register');

  title.textContent = 'Solicitar Serviço';
  content.innerHTML = `
      <div class="form-content">
        <div class="form-center">
          <label class="label">Ambiente do Serviço:</label>
          <div class="form-group">
            <input class="form-group-input" type="text" id="envName" required>
            <label class="form-group-label" for="">Nome do Ambiente:</label>
            ${formGroupPort}
          </div>
        </div>
        <div id="divServiceType" class="form-center">
          <label class="label">Tipo de Serviço:</label>
          <div class="radio-container">
            <label class="label">
              <input type="radio" class="radio" name="request-type" value="Instalação">
              <span class="span">Instalação</span>
            </label>
            <label class="label">
              <input type="radio" class="radio" name="request-type" value="Manutenção">
              <span class="span">Manutenção</span>
            </label>
          </div>
        </div>      
        <div id="description-container" class="hidden">        
          <label class="label">Selecione o(s) problema(s):</label>
          <div class="data-items">
            <label class="label">
              <input type="checkbox" class="checkbox" class="checkbox" name="problem" value="Não refrigera">
              <span class="span">Não refrigera</span>
            </label>
            <label class="label">
              <input type="checkbox" class="checkbox" class="checkbox" name="problem" value="Barulho anormal">
              <span class="span">Barulho anormal</span>
            </label>
            <label class="label">
              <input type="checkbox" class="checkbox" class="checkbox" name="problem" value="Vazamentos">
              <span class="span">Vazamentos</span>
            </label>
            <label class="label">
              <input type="checkbox" class="checkbox" class="checkbox" name="problem" value="Mal cheiro">
              <span class="span">Mal cheiro</span>
            </label>
          </div>
        </div>
        <div id="equipment-container" class="hidden">
          <label class="label">Equipamento para Instalação:</label>
          <div class="data-items">
            <label class="label">
              <input type="radio" class="radio" name="equipment" value="Possuo Equipamento">
              <span class="span">Já possuo Equipamento</span>
            </label>
            <label class="label">
              <input type="radio" class="radio" name="equipment" value="Equipamento Novo">
              <span class="span">Acrescentar Equipamento Novo</span>
            </label>
            <label class="label">
              <input type="radio" class="radio" name="equipment" value="Recondicionado pela GTA">
              <span class="span">Recondicionado pela GTA</span>
            </label>
          </div>
        </div>
      </div>
    `;

  footer.innerHTML = `
      <div class="modal-user-footer">
        <button type="button" id="saveRequest" class="modal-content-btn-ok"> Enviar </button>
      </div>
    `;

  btnClose.onclick = async function () {
    closeModalRegister();
  };

  modal.style.display = 'block';

  function toggleVisibilityBasedOnServiceType() {
    const requestTypeInputs = document.querySelectorAll(
      'input[name="request-type"]'
    );
    const descriptionContainer = document.getElementById(
      'description-container'
    );
    const equipmentContainer = document.getElementById('equipment-container');
    requestTypeInputs.forEach((input) => {
      input.addEventListener('change', () => {
        if (input.value === 'Manutenção' && input.checked) {
          descriptionContainer.classList.remove('hidden');
          descriptionContainer.classList.add('form-center');
          equipmentContainer.classList.remove('form-center');
          equipmentContainer.classList.add('hidden');
          clearEquipmentSelection();
        } else if (input.value === 'Instalação' && input.checked) {
          equipmentContainer.classList.remove('hidden');
          equipmentContainer.classList.add('form-center');
          descriptionContainer.classList.remove('form-center');
          descriptionContainer.classList.add('hidden');
          clearCheckboxSelection();
        }
      });
    });
  }

  function clearCheckboxSelection() {
    const problemCheckboxes = document.querySelectorAll(
      'input[name="problem"]'
    );
    problemCheckboxes.forEach((checkbox) => (checkbox.checked = false));
  }

  function clearEquipmentSelection() {
    const equipmentRadios = document.querySelectorAll(
      'input[name="equipment"]'
    );
    equipmentRadios.forEach((radio) => (radio.checked = false));
  }

  toggleVisibilityBasedOnServiceType();

  document.getElementById('saveRequest').addEventListener('click', async () => {
    const environment = document.getElementById('envName');
    const status = 'Pendente';
    const data = {};

    if (environment.value === '') {
      showModalAlert(
        'Alert',
        'Nome do Ambiente',
        'Por favor, digite um nome para o ambiente do serviço. (Ex.: sala, quarto1, sala202...).',
        closeModal
      );
      return;
    }

    const serviceTypeInput = document.querySelector(
      'input[name="request-type"]:checked'
    );

    const serviceType = serviceTypeInput ? serviceTypeInput.value : '';

    if (serviceType === 'Manutenção') {
      const serviceDescription = Array.from(
        document.querySelectorAll('input[name="problem"]:checked')
      )
        .map((checkbox) => checkbox.value)
        .join(', ');

      if (!serviceDescription) {
        showModalAlert(
          'Alert',
          'Selecione Problemas',
          'Por favor, marque pelo menos um problema em seu equipamento.',
          closeModal
        );
        return;
      }
      data.maintenanceProblem = serviceDescription;
    }

    if (serviceType === 'Instalação') {
      const equipmentInput = document.querySelector(
        'input[name="equipment"]:checked'
      );
      if (!equipmentInput) {
        showModalAlert(
          'Alert',
          'Equipamento',
          'Por favor, selecione uma opção de equipamento para instalação.',
          closeModal
        );
        return;
      }
      data.installationEquipment = equipmentInput.value;
    }

    if (!serviceType) {
      showModalAlert(
        'Alert',
        'Tipo de Serviço',
        'Marque o tipo de serviço.',
        closeModal
      );
      return;
    }

    data.clientId = address.clientId;
    data.addressId = address._id;
    data.envName = environment.value;
    data.requestType = serviceType;
    data.requestStatus = status;

    try {
      const requestData = await registerRequest(data);
      if (requestData.status === 401) {
        showModalAlert('Next', requestData.title, requestData.msg, async () => {
          await exitSession();
        });
      } else if (
        requestData.status === 400 ||
        requestData.status === 409 ||
        requestData.status === 500
      ) {
        showModalAlert('Alert', requestData.title, requestData.msg, closeModal);
      } else if (requestData.status === 201) {
        const level = requestData.level;
        showModalAlert('Next', requestData.title, requestData.msg, async () => {
          await openSession(level);
          closeModalRegister();
        });
      }
    } catch (error) {
      showModalAlert('Erro de Conexão', error.message, closeModal);
    }
  });
}

export async function modalNewRequestEnvironment(env) {
  const modal = document.getElementById('modal-register');
  const title = document.getElementById('modal-register-title');
  const content = document.getElementById('modal-register-main');
  const footer = document.getElementById('modal-register-footer');
  const btnClose = document.getElementById('close-register');

  title.textContent = 'Solicitar Serviço';
  content.innerHTML = `
      <div class="form-content">
        <div class="form-center">
          <label class="label">Ambiente: ${env.environmentName}</label>
          <label class="label">Nome: ${env.environmentName}</label>
          <label class="label">Tamanho: ${env.environmentSize} m²</label>
        </div>
        <div id="divServiceType" class="form-center">
          <label class="label">Tipo de Serviço:</label>
          <div class="radio-container">
            <label class="label">
              <input type="radio" class="radio" name="request-type" value="Instalação">
              <span class="span">Instalação</span>
            </label>
            <label class="label">
              <input type="radio" class="radio" name="request-type" value="Manutenção">
              <span class="span">Manutenção</span>
            </label>
          </div>
        </div>      
        <div id="description-container" class="hidden">        
          <label class="label">Selecione o(s) problema(s):</label>
          <div class="data-items">
            <label class="label">
              <input type="checkbox" class="checkbox" class="checkbox" name="problem" value="Não refrigera">
              <span class="span">Não refrigera</span>
            </label>
            <label class="label">
              <input type="checkbox" class="checkbox" class="checkbox" name="problem" value="Barulho anormal">
              <span class="span">Barulho anormal</span>
            </label>
            <label class="label">
              <input type="checkbox" class="checkbox" class="checkbox" name="problem" value="Vazamentos">
              <span class="span">Vazamentos</span>
            </label>
            <label class="label">
              <input type="checkbox" class="checkbox" class="checkbox" name="problem" value="Mal cheiro">
              <span class="span">Mal cheiro</span>
            </label>
          </div>
        </div>
        <div id="equipment-container" class="hidden">
          <label class="label">Equipamento para Instalação:</label>
          <div class="data-items">
            <label class="label">
              <input type="radio" class="radio" name="equipment" value="Possuo Equipamento">
              <span class="span">Já possuo Equipamento</span>
            </label>
            <label class="label">
              <input type="radio" class="radio" name="equipment" value="Equipamento Novo">
              <span class="span">Acrescentar Equipamento Novo</span>
            </label>
            <label class="label">
              <input type="radio" class="radio" name="equipment" value="Recondicionado pela GTA">
              <span class="span">Recondicionado pela GTA</span>
            </label>
          </div>
        </div>
      </div>
    `;

  footer.innerHTML = `
      <div class="modal-user-footer">
        <button type="button" id="saveRequest" class="modal-content-btn-ok"> Enviar </button>
      </div>
    `;

  btnClose.onclick = async function () {
    closeModalRegister();
  };

  modal.style.display = 'block';

  function toggleVisibilityBasedOnServiceType() {
    const requestTypeInputs = document.querySelectorAll(
      'input[name="request-type"]'
    );
    const descriptionContainer = document.getElementById(
      'description-container'
    );
    const equipmentContainer = document.getElementById('equipment-container');
    requestTypeInputs.forEach((input) => {
      input.addEventListener('change', () => {
        if (input.value === 'Manutenção' && input.checked) {
          descriptionContainer.classList.remove('hidden');
          descriptionContainer.classList.add('form-center');
          equipmentContainer.classList.remove('form-center');
          equipmentContainer.classList.add('hidden');
          clearEquipmentSelection();
        } else if (input.value === 'Instalação' && input.checked) {
          equipmentContainer.classList.remove('hidden');
          equipmentContainer.classList.add('form-center');
          descriptionContainer.classList.remove('form-center');
          descriptionContainer.classList.add('hidden');
          clearCheckboxSelection();
        }
      });
    });
  }

  function clearCheckboxSelection() {
    const problemCheckboxes = document.querySelectorAll(
      'input[name="problem"]'
    );
    problemCheckboxes.forEach((checkbox) => (checkbox.checked = false));
  }

  function clearEquipmentSelection() {
    const equipmentRadios = document.querySelectorAll(
      'input[name="equipment"]'
    );
    equipmentRadios.forEach((radio) => (radio.checked = false));
  }

  toggleVisibilityBasedOnServiceType();

  document.getElementById('saveRequest').addEventListener('click', async () => {
    const data = {
      clientId: env.clientId,
      addressId: env.addressId,
      environmentId: env._id,
      requestStatus: 'Pendente',
    };

    const serviceTypeInput = document.querySelector(
      'input[name="request-type"]:checked'
    );

    const serviceType = serviceTypeInput ? serviceTypeInput.value : '';

    if (serviceType === 'Manutenção') {
      const serviceDescription = Array.from(
        document.querySelectorAll('input[name="problem"]:checked')
      )
        .map((checkbox) => checkbox.value)
        .join(', ');

      if (!serviceDescription) {
        showModalAlert(
          'Alert',
          'Selecione Problemas',
          'Por favor, marque pelo menos um problema em seu equipamento.',
          closeModal
        );
        return;
      }
      data.maintenanceProblem = serviceDescription;
    }

    if (serviceType === 'Instalação') {
      const equipmentInput = document.querySelector(
        'input[name="equipment"]:checked'
      );
      if (!equipmentInput) {
        showModalAlert(
          'Alert',
          'Equipamento',
          'Por favor, selecione uma opção de equipamento para instalação.',
          closeModal
        );
        return;
      }
      data.installationEquipment = equipmentInput.value;
    }

    if (!serviceType) {
      showModalAlert(
        'Alert',
        'Tipo de Serviço',
        'Marque o tipo de serviço.',
        closeModal
      );
      return;
    }

    data.requestType = serviceType;

    try {
      const requestData = await registerRequest(data);
      if (requestData.status === 401) {
        showModalAlert('Next', requestData.title, requestData.msg, async () => {
          await exitSession();
        });
      } else if (
        requestData.status === 400 ||
        requestData.status === 409 ||
        requestData.status === 500
      ) {
        showModalAlert('Alert', requestData.title, requestData.msg, closeModal);
      } else if (requestData.status === 201) {
        const level = requestData.level;
        showModalAlert('Next', requestData.title, requestData.msg, async () => {
          await openSession(level);
          closeModalRegister();
        });
      }
    } catch (error) {
      showModalAlert('Erro de Conexão', error.message, closeModal);
    }
  });
}
