import {
  generateQrcodeEnvironmentHistory,
  historyMaintenance,
  newServiceAddress,
  newServiceEnvironment,
  renderAddressClient,
  renderEnvironmentDetailsClient,
  renderRequestDetail,
} from '../scripts/icons.js';
import {
  closeModal,
  closeModalDetails,
  closeModalRegister,
  exitSession,
  openSession,
  returnModal,
  showModalAlert,
} from '../scripts/modals.js';
import {
  dataClient,
  environmentAddressClient,
  registerAddress,
  requestsAddressId,
  userAddress,
  requestsEnvId,
  environmentAllServices,
  qrCodeGenerate,
} from '../scripts/fetch.js';
import { formatPostalCode } from '../scripts/validation.js';
import {
  modalNewRequestAddress,
  modalNewRequestEnvironment,
} from './Service.js';

export async function openListAddressClient() {
  let addresses = [];
  try {
    const addressData = await userAddress();
    if (addressData.status === 401) {
      showModalAlert('Next', addressData.title, addressData.msg, async () => {
        await exitSession();
      });
    } else if (addressData.status === 403) {
      showModalAlert('Next', addressData.title, addressData.msg, async () => {
        window.location.reload();
      });
    } else if (addressData.status === 400) {
      addresses = [];
    } else if (addressData.status === 200) {
      const level = addressData.level;
      await openSession(level);
      addresses = [...addressData.listAddress];
    }
  } catch (error) {
    console.error('Erro ao buscar dados de endereço:', error);
    showModalAlert('Alert', 'Erro de Conexão!', error.message, closeModal);
    return;
  }

  if (addresses.length === 0) {
    showModalAlert(
      'Next',
      'Nenhum Endereço Cadastrado!',
      'Por favor, cadastre endereço para esse cliente.',
      async () => {
        await newAddress();
      }
    );
  }

  const modal = document.getElementById('modal-register');
  const title = document.getElementById('modal-register-title');
  const content = document.getElementById('modal-register-main');
  const footer = document.getElementById('modal-register-footer');
  const btnClose = document.getElementById('close-register');

  title.textContent = 'Endereços de Ambientes';

  content.innerHTML = `
      <div class="form-center-item">
        <select class="select" id="filter-address-type">
          <option value="">Tipo de Endereço: Todos</option>
          <option value="Residencial">Residencial</option>
          <option value="Empresarial">Empresarial</option>
        </select>
      </div>
      <table class="details-table">
        <thead>
          <tr>
            <th>Endereço - Tipo</th>
          </tr>
        </thead>
        <tbody id="address-list">
          ${renderAddressClientsRows(addresses)}
        </tbody>
      </table>
    `;

  footer.innerHTML = `
      <div class="modal-user-footer">
        
      </div>
    `;

  modal.style.display = 'block';

  btnClose.onclick = () => {
    closeModalRegister();
  };

  const addressTypeFilter = document.getElementById('filter-address-type');

  addressTypeFilter.addEventListener('change', () => {
    filterAddressClients();
  });

  function filterAddressClients() {
    const selectedTypes = document.getElementById('filter-address-type').value;

    const filteredAddress = addresses.filter(
      (address) => !selectedTypes || address.addressType === selectedTypes
    );

    document.getElementById('address-list').innerHTML =
      renderAddressClientsRows(filteredAddress);
  }
}

function renderAddressClientsRows(addresses) {
  return addresses
    .map(
      (address) => `
        <tr>
          <td>
            <div class="center">
              ${address.street} Nº${address.number} ${
        address.complement || ''
      } - ${address.addressType}
              ${renderAddressClient(address)}
            </div>
          </td>
        </tr>
      `
    )
    .join('');
}

document.addEventListener('click', async (event) => {
  const target = event.target.closest('.view-address-btn');
  if (target) {
    const addressClientDetails = JSON.parse(target.dataset.address);
    await openDetailsClientAddressId(addressClientDetails);
    closeModalRegister();
  }
});

export async function openDetailsClientAddressId(address) {
  let addressEnvironments = [];

  try {
    const environmentAddress = await environmentAddressClient(address._id);
    if (environmentAddress.status === 401) {
      showModalAlert(
        'Next',
        environmentAddress.title,
        environmentAddress.msg,
        async () => {
          await exitSession();
        }
      );
    } else if (environmentAddress.status === 403) {
      showModalAlert(
        'Alert',
        environmentAddress.title,
        environmentAddress.msg,
        closeModal
      );
      return;
    } else if (environmentAddress.status === 400) {
      addressEnvironments = [];
    } else if (environmentAddress.status === 200) {
      const level = environmentAddress.level;
      await openSession(level);
      addressEnvironments = [...environmentAddress.environmentsAddress];
    }
  } catch (error) {
    console.error('Erro ao buscar dados de endereço:', error);
    showModalAlert('Alert', 'Erro de Conexão!', error.message, closeModal);
    return;
  }

  let addressRequests = [];

  try {
    const dataRequestsAddress = await requestsAddressId(address._id);
    if (dataRequestsAddress.status === 401) {
      showModalAlert(
        'Next',
        dataRequestsAddress.title,
        dataRequestsAddress.msg,
        async () => {
          await exitSession();
        }
      );
    } else if (
      dataRequestsAddress.status === 403 ||
      dataRequestsAddress.status === 404
    ) {
      showModalAlert(
        'Alert',
        dataRequestsAddress.title,
        dataRequestsAddress.msg,
        closeModal
      );
      return;
    } else if (dataRequestsAddress.status === 400) {
      addressRequests = [];
    } else if (dataRequestsAddress.status === 200) {
      const level = dataRequestsAddress.level;
      await openSession(level);
      addressRequests = [...dataRequestsAddress.requests];
    }
  } catch (error) {
    console.error('Erro ao buscar dados de endereço:', error);
    showModalAlert('Alert', 'Erro de Conexão!', error.message, closeModal);
    return;
  }

  const includeEnvironment = `
    <div class="center">
      Solicitar Serviço para esse Endereço
      ${newServiceAddress(address)}
    </div>
  `;

  const reqAddress =
    addressRequests.length > 0
      ? `<div class="form-center">
          <table class="details-table">
            <tbody>
              <tr>
                <td colspan="2" style="text-align: center; background-color: var(--color-invalid);">
                  Não há Ambientes cadastrados nesse Endereço
                </td>
              </tr>
            </tbady>
          </table>
          <label class="label">Requisições Abertas para o Endereço</label>
          <table class="details-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Requisição</th>
              </tr>
            </thead>
            <tbody id="request-list">
              ${renderRequestRows(addressRequests)}
            </tbody>
          </table>
        </div>`
      : `<table class="details-table">
          <tbody>
            <tr>
              <td colspan="2" style="text-align: center; background-color: var(--color-invalid);">
                Não há Ambientes ou Requisiçoes cadastrados nesse Endereço
              </td>
            </tr>
            <tr>
              <td colspan="2" style="text-align: center;">
                ${includeEnvironment}
              </td>
            </tr>
          </<tbody>
        </table>`;
  function renderRequestRows(requests) {
    return requests
      .map(
        (request) => `
          <tr>
            <td>${request.requestStatus}</td>
            <td>
              <div class="center">
                ${request.requestNumber}
                ${renderRequestDetail(request)}
              </div>
            </td>
          </tr>
        `
      )
      .join('');
  }

  const environments =
    addressEnvironments.length > 0
      ? `<table class="details-table">
          <thead>
            <tr>
              <th colspan="2" style="text-align: center;">
                Ambientes do Endereço
              </th>
            </tr>
          </thead>
          <tbody>
            ${renderTableEnvironmets(addressEnvironments)}
          </tbody>
        </table>`
      : reqAddress;
  function renderTableEnvironmets(envs) {
    return envs
      .map(
        (env) => `
          <tr>
            <td colspan="2">
              <div class="center">
                ${env.environmentName}
                ${renderEnvironmentDetailsClient(env, address)}
              </div>
            </td>
          </tr>
        `
      )
      .join('');
  }

  const isComplement =
    address.complement && Object.keys(address.complement).length > 0;
  const complement =
    isComplement && address.complement.length > 0
      ? `<tr>
          <td>Complemento:</td>
          <td>${address.complement}</td>
        </tr>`
      : '';

  const modal = document.getElementById('modal-details');
  const title = document.getElementById('modal-details-title');
  const content = document.getElementById('modal-details-main');
  const btnClose = document.getElementById('close-details');
  const btnReturn = document.getElementById('arrow-details');
  const footer = document.getElementById('modal-details-footer');

  title.textContent = 'Detalhamento do Endereço';

  content.innerHTML = `
    <div class="form-center-item">
      <table class="details-table">
        <thead>
          <tr>
            <th colspan="2" style="text-align: center;">
              Endereço ${address.addressType}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colspan="2">${address.street}</td>
          </tr>
          <tr>
            <td>Número:</td>
            <td>${address.number}</td>
          </tr>
          ${complement}
          <tr>
            <td>Bairro:</td>
            <td>${address.district}</td>
          </tr>
          <tr>
            <td>Cidade:</td>
            <td>${address.city} / ${address.state}</td>
          </tr>
          <tr>
            <td>CEP:</td>
            <td>${formatPostalCode(address.postalCode)}</td>
          </tr>
        </tbody>
      </table>
      ${environments}
    </div>
  `;

  footer.innerHTML = `
    <div class="modal-user-footer">
      
    </div>
  `;

  modal.style.display = 'block';

  document.addEventListener('click', async (event) => {
    const target = event.target.closest('.service-address-btn');
    if (target) {
      const address = JSON.parse(target.dataset.service);
      await modalNewRequestAddress(address);
      closeModalDetails();
    }
  });

  document.addEventListener('click', async (event) => {
    const target = event.target.closest('.view-env-btn');
    if (target) {
      const data = JSON.parse(target.dataset.env);
      await envAddressDetails(data);
    }
  });

  btnReturn.onclick = async function () {
    await openListAddressClient();
    closeModalDetails();
  };

  btnClose.onclick = async function () {
    closeModalDetails();
  };
}

export async function envAddressDetails(data) {
  let envRequests = [];
  try {
    const dataRequestsEnv = await requestsEnvId(data.env._id);
    if (dataRequestsEnv.status === 401) {
      showModalAlert(
        'Next',
        dataRequestsEnv.title,
        dataRequestsEnv.msg,
        async () => {
          await exitSession();
        }
      );
    } else if (
      dataRequestsEnv.status === 403 ||
      dataRequestsEnv.status === 404
    ) {
      showModalAlert(
        'Alert',
        dataRequestsEnv.title,
        dataRequestsEnv.msg,
        closeModal
      );
      return;
    } else if (dataRequestsEnv.status === 400) {
      envRequests = [];
    } else if (dataRequestsEnv.status === 200) {
      const level = dataRequestsEnv.level;
      await openSession(level);
      envRequests = [...dataRequestsEnv.requests];
    }
  } catch (error) {
    console.error('Erro ao buscar dados de endereço:', error);
    showModalAlert('Alert', 'Erro de Conexão!', error.message, closeModal);
    return;
  }

  const includeEnvironment = `
    <div class="center">
      Solicitar Serviço para esse Ambiente
      ${newServiceEnvironment(data.env)}
    </div>
  `;

  const reqEnv =
    envRequests.length > 0
      ? `<div class="form-center">
          <label class="label">Requisições Abertas para o Ambiente</label>
          <table class="details-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Requisição</th>
              </tr>
            </thead>
            <tbody id="request-list">
              ${renderRequestRows(envRequests)}
            </tbody>
          </table>
        </div>`
      : `<table class="details-table">
          <tbody>
            <tr>
              <td colspan="2" style="text-align: center; background-color: var(--color-main);">
                Não há Requisiçoes cadastrados nesse Ambiente
              </td>
            </tr>
            <tr>
              <td colspan="2" style="text-align: center;">
                ${includeEnvironment}
              </td>
            </tr>
          </<tbody>
        </table>`;
  function renderRequestRows(requests) {
    return requests
      .map(
        (request) => `
          <tr>
            <td>${request.requestStatus}</td>
            <td>
              <div class="center">
                ${request.requestNumber}
                ${renderRequestDetail(request)}
              </div>
            </td>
          </tr>
        `
      )
      .join('');
  }

  const modal = document.getElementById('modal-details');
  const title = document.getElementById('modal-details-title');
  const content = document.getElementById('modal-details-main');
  const btnClose = document.getElementById('close-details');
  const btnReturn = document.getElementById('arrow-details');
  const footer = document.getElementById('modal-details-footer');

  title.textContent = 'Detalhamento do Ambiente';

  content.innerHTML = `
    <div class="form-center">
      <table class="details-table">
        <thead>
          <tr>
            <th colspan="2" style="text-align: center;">
              Ambiente ${data.env.environmentName}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Área (m²)</td>
            <td>${data.env.environmentSize}</td>
          </tr>
          <tr>
            <td>Equipamento:</td>
            <td>
              ${data.env.equipmentNumber}  
            </td>
          </tr>
          <tr>
            <td>Tipo:</td>
            <td>${data.env.equipmentType}</td>
          </tr>
          <tr>
            <td>Marca:</td>
            <td>${data.env.equipmentBrand}</td>
          </tr>
          <tr>
            <td>Modelo:</td>
            <td>${data.env.equipmentModel}</td>
          </tr>
          <tr>
            <td>Capacidade (Btu):</td>
            <td>${data.env.capacityBTU}</td>
          </tr>
          <tr>
            <td>Ciclos:</td>
            <td>${data.env.cicle}</td>
          </tr>
          <tr>
            <td>Voltagem:</td>
            <td>${data.env.volt}</td>
          </tr>
          <tr>
            <td>Número de Série:</td>
            <td>${data.env.serialModel}</td>
          </tr>
        </tbody>
      </table>
      <div class="button-client-table">
        ${historyMaintenance(data)}
        ${generateQrcodeEnvironmentHistory(data)}
      </div>
      ${reqEnv}
    </div>
  `;

  footer.innerHTML = `
    <div class="modal-user-footer">
      
    </div>
  `;

  modal.style.display = 'block';

  btnReturn.onclick = async function () {
    await openDetailsClientAddressId(data.address);
  };

  btnClose.onclick = async function () {
    closeModalDetails();
  };

  document.addEventListener('click', async (event) => {
    const target = event.target.closest('.service-environment-btn');
    if (target) {
      const env = JSON.parse(target.dataset.service);
      await modalNewRequestEnvironment(env);
      closeModalDetails();
    }
  });

  document.addEventListener('click', async (event) => {
    const target = event.target.closest('.history-maintenance-btn');
    if (target) {
      const data = JSON.parse(target.dataset.history);
      await servicesEquipment(data);
    }
  });

  document.addEventListener('click', async (event) => {
    const target = event.target.closest('.history-qrcode-btn');
    if (target) {
      const data = JSON.parse(target.dataset.qrcode);
      await generateQrcode(data);
    }
  });
}

async function generateQrcode(data) {
  try {
    const qrCodeImage = await qrCodeGenerate(data.env._id);

    if (qrCodeImage.status === 200) {
      modalQrcodeImage(qrCodeImage, data);
      return closeModalDetails();
    } else {
      showModalAlert('Next', qrCodeImage.title, qrCodeImage.msg, async () => {
        await envAddressDetails(data);
      });
    }
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    showModalAlert('Alert', 'Erro de Conexão!', error.message, closeModal);
    return;
  }
}

///////////////////////////////////////

function modalQrcodeImage(dataCode, data) {
  const modal = document.getElementById('modal-register');
  const title = document.getElementById('modal-register-title');
  const content = document.getElementById('modal-register-main');
  const footer = document.getElementById('modal-register-footer');
  const btnClose = document.getElementById('close-register');

  title.textContent = `${dataCode.title}`;

  content.innerHTML = '';

  const orderNumber = document.createElement('label');
  orderNumber.textContent = `${dataCode.number}`;
  orderNumber.classList.add('label');

  const qrCodeImage = document.createElement('img');
  qrCodeImage.src = dataCode.msg;
  qrCodeImage.alt = `QRCode para acessar histórico de manutenção do equipamento ${dataCode.number}`;

  content.appendChild(qrCodeImage);
  content.appendChild(orderNumber);

  footer.innerHTML = `
    <div class="modal-user-footer">
      <button type="button" id="print-button" class="modal-content-btn-ok">Imprimir</button>
    </div>
  `;

  const printButton = document.getElementById('print-button');

  printButton.onclick = async function () {
    printModalContent(content);
    await envAddressDetails(data);
    closeModalRegister();
  };

  modal.style.display = 'block';

  btnClose.onclick = async function () {
    await envAddressDetails(data);
    closeModalRegister();
  };
}

function printModalContent(content) {
  const qrcodeImage = content.innerHTML;

  let printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
    <head>
      <title>Impressão do QR Code</title>
    </head>
    <body>
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: verdana, sans-serif, lucida; font-weight: 600; font-size: 16px; text-align: center; color: #474747;">
        <span style="font-weight: 800; color: #057ca8;">
          GTA Ar Condicionando
        </span>
        ${qrcodeImage}
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}

//////////////////////////////////////

async function servicesEquipment(data) {
  let servicesData = [];
  try {
    const serviceList = await environmentAllServices(data.env._id);
    if (serviceList.status === 400) {
      servicesData = [];
    } else if (serviceList.status === 200) {
      servicesData = [...serviceList.historys];
    } else {
      showModalAlert('Next', serviceList.title, serviceList.msg, async () => {
        await envAddressDetails(data);
      });
    }
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    showModalAlert('Alert', 'Erro de Conexão!', error.message, closeModal);
    return;
  }

  if (servicesData.length === 0) {
    showModalAlert(
      'Next',
      'Não há Serviços!',
      'Não há histórico de Serviços executados para este equipamento',
      async () => {
        await envAddressDetails(env);
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

  const modal = document.getElementById('modal-details');
  const title = document.getElementById('modal-details-title');
  const content = document.getElementById('modal-details-main');
  const btnClose = document.getElementById('close-details');
  const btnReturn = document.getElementById('arrow-details');
  const footer = document.getElementById('modal-details-footer');

  title.textContent = 'Histórico de Serviços';

  content.innerHTML = `
    <table class="details-table">
      <thead>
        <tr>
          <th colspan="2" style="text-align: center;">
            Equipamento ${data.env.equipmentNumber}
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

  btnReturn.onclick = async function () {
    await envAddressDetails(data);
  };

  btnClose.onclick = async function () {
    closeModalDetails();
  };
}

export async function newAddress() {
  let client;
  try {
    const userClient = await dataClient();
    if (userClient.status === 401) {
      showModalAlert('Next', userClient.title, userClient.msg, async () => {
        await exitSession();
      });
    } else if (userClient.status === 404 || userClient.status === 400) {
      showModalAlert('Next', userClient.title, userClient.msg, async () => {
        window.location.reload();
      });
    } else if (userClient.status === 200) {
      const level = userClient.level;
      await openSession(level);
      client = userClient.clientData;
    }
  } catch (error) {
    console.error('Erro ao buscar dados de endereço:', error);
    showModalAlert('Alert', 'Erro de Conexão!', error.message, closeModal);
    return;
  }
  const modal = document.getElementById('modal-details');
  const title = document.getElementById('modal-details-title');
  const content = document.getElementById('modal-details-main');
  const btnClose = document.getElementById('close-details');
  const btnReturn = document.getElementById('arrow-details');
  const footer = document.getElementById('modal-details-footer');

  title.textContent = 'Cadastro de Endereço';
  content.innerHTML = `
    <div class="form-content">
      <div class="form-center">
        <label class="label"> Tipo de Endereço: </label>
        <div class="radio-container">
          <label class="label">
            <input type="radio" class="radio" name="addressType" value="Residencial">
            <span class="span">Residencial</span>
          </label>
          <label class="label">
            <input type="radio" class="radio" name="addressType" value="Empresarial">
            <span class="span">Empresarial</span>
          </label>
        </div>
      </div>
      <div id="divPostalCod" class="hidden" style="width: 50%;">
        <input class="form-group-input" type="tel" id="postalCode" name="postalCode" required maxlength="9" inputmode="numeric">
        <label class="form-group-label" for="">Digite o CEP:</label>
      </div>
      <div id="form-address-data" class="hidden">
        <div class="data-items">
          <label class="label">
            Endereço:
            <span id="street" class="span"></span>
          </label>
          <label class="label">
            Bairro:
            <span id="district" class="span"></span>
          </label>
          <label class="label">
            Cidade:
            <span id="city" class="span"></span> / 
            <span id="state" class="span"></span>
          </label>
        </div>
        <div class="form-center">
          <div class="form-group" style="width: 60%;">
            <input class="form-group-input" type="tel" id="number" name="number" required maxlength="9" inputmode="numeric">
            <label class="form-group-label" for="">Número:</label>
          </div>
          <div class="form-group" style="width: 60%;">
            <input class="form-group-input" type="text" id="complement" name="complement" maxlength="15" placeholder="">
            <label class="form-group-label" for="">Complemento:</label>
          </div>
        </div>
      </div>      
    </div>
  `;

  footer.innerHTML = `
    <div class="modal-user-footer">
      <button type="button" id="createBtn" class="modal-content-btn-disabled" disabled>Salvar</button>
    </div>
  `;

  btnReturn.onclick = async function () {
    await returnModal();
    closeModalDetails();
  };

  btnClose.onclick = async function () {
    window.location.reload();
  };

  modal.style.display = 'block';

  function toggleAddressFields() {
    const addressTypeInputs = document.querySelectorAll(
      'input[name="addressType"]'
    );

    const postalCodeContainer = document.getElementById('divPostalCod');

    addressTypeInputs.forEach((input) => {
      input.addEventListener('change', () => {
        if (input.checked) {
          postalCodeContainer.classList.remove('hidden');
          postalCodeContainer.classList.add('form-group');
        }
      });
    });
  }

  toggleAddressFields();

  function validateAddressForm() {
    const createBtn = document.getElementById('createBtn');
    const street = document.getElementById('street').textContent.trim();
    const number = document.getElementById('number').value.trim();
    const district = document.getElementById('district').textContent.trim();
    const city = document.getElementById('city').textContent.trim();
    const state = document.getElementById('state').textContent.trim();
    const postalCode = document.getElementById('postalCode').value.trim();
    const addressType = document.querySelector(
      'input[name="addressType"]:checked'
    );

    const isFormValid =
      postalCode !== '' &&
      street !== '' &&
      district !== '' &&
      city !== '' &&
      state !== '' &&
      number !== '' &&
      !isNaN(number) &&
      parseInt(number) >= 1 &&
      addressType !== null;

    createBtn.disabled = !isFormValid;
    createBtn.className = isFormValid
      ? 'modal-content-btn-ok'
      : 'modal-content-btn-disabled';
  }

  function setupFormValidation() {
    const inputsToWatch = ['postalCode', 'number'];

    inputsToWatch.forEach((id) => {
      const input = document.getElementById(id);
      input.addEventListener('input', validateAddressForm);
    });

    const addressTypeInputs = document.querySelectorAll(
      'input[name="addressType"]'
    );
    addressTypeInputs.forEach((input) =>
      input.addEventListener('change', validateAddressForm)
    );

    ['street', 'district', 'city', 'state'].forEach((id) => {
      const element = document.getElementById(id);
      const observer = new MutationObserver(validateAddressForm);
      observer.observe(element, { childList: true, subtree: true });
    });
  }

  setupFormValidation();

  const createNewAddress = document.getElementById('createBtn');
  createNewAddress.addEventListener('click', async () => {
    const street = document.getElementById('street').textContent;
    const number = document.getElementById('number').value;
    const complement = document.getElementById('complement').value;
    const district = document.getElementById('district').textContent;
    const city = document.getElementById('city').textContent;
    const state = document.getElementById('state').textContent;
    const postalCode = document.getElementById('postalCode').value;
    const addressTypeInput = document.querySelector(
      'input[name="addressType"]:checked'
    );
    const addressType = addressTypeInput ? addressTypeInput.value : '';
    if (postalCode.trim() === '') {
      showModalAlert(
        'Alert',
        'CEP Obrigatório!!',
        'Digite o CEP do endereço.',
        closeModal
      );
      return;
    }
    if (
      street.trim() === '' ||
      district.trim() === '' ||
      city.trim() === '' ||
      state.trim() === ''
    ) {
      showModalAlert(
        'Alert',
        'Endereço Obrigatório!!',
        'Digite um CEP válido para carregar o endereço.',
        closeModal
      );
      return;
    }
    if (number.trim() === '' || isNaN(number) || parseInt(number) < 1) {
      showModalAlert(
        'Alert',
        'Número Inválido!!',
        'Digite um número válido para o endereço.',
        closeModal
      );
      return;
    }
    if (addressType === '') {
      showModalAlert(
        'Alert',
        'Tipo de Endereço!!',
        'Selecione um tipo de endereço.',
        closeModal
      );
      return;
    }

    const dataSend = {
      clientId: client._id,
      postalCode: postalCode,
      street: street,
      number: number,
      complement: complement,
      district: district,
      city: city,
      state: state,
      addressType: addressType,
    };
    try {
      const dataAddressUser = await registerAddress(dataSend);
      if (dataAddressUser.status === 401) {
        showModalAlert(
          'Next',
          dataAddressUser.title,
          dataAddressUser.msg,
          async () => {
            await exitSession();
          }
        );
      } else if (
        dataAddressUser.status === 400 ||
        dataAddressUser.status === 409 ||
        dataAddressUser.status === 500
      ) {
        showModalAlert(
          'Alert',
          dataAddressUser.title,
          dataAddressUser.msg,
          closeModal
        );
      } else if (dataAddressUser.status === 201) {
        const level = dataAddressUser.level;
        await openSession(level);
        await returnModal();
        closeModalDetails();
      }
    } catch (error) {
      console.error('Erro ao cadastrar endereço:', error);
      showModalAlert('Alert', 'Erro de conexão', error.message, closeModal);
    }
  });

  const postalCodeInput = document.getElementById('postalCode');
  const numberInput = document.getElementById('number');

  postalCodeInput.addEventListener('input', function () {
    this.value = this.value.replace(/[^0-9]/g, '');
  });

  numberInput.addEventListener('input', function () {
    this.value = this.value.replace(/[^0-9]/g, '');
  });

  postalCodeInput.addEventListener('input', formatPostalCode);
  postalCodeInput.addEventListener('input', checkPostalCodeLength);
  numberInput.addEventListener('input', formatNumber);

  function formatPostalCode(event) {
    const input = event.target;
    input.value = input.value.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  function formatNumber(event) {
    const input = event.target;
    input.value = input.value.replace(/^0+/, '');
  }

  async function checkPostalCodeLength(event) {
    const input = event.target;
    const addressDataDiv = document.getElementById('form-address-data');
    const numberField = document.getElementById('number');
    const length = input.value.length;
    if (length === 9) {
      const isValid = await reqPostalCode(input.value);
      if (isValid) {
        input.style.backgroundColor = 'var(--color-valid)';
        input.style.color = 'var(--color-3)';
        addressDataDiv.classList.remove('hidden');
        addressDataDiv.classList.add('form-center');
        numberField.disabled = false;
        numberField.focus();
      } else {
        input.style.backgroundColor = 'var(--color-invalid)';
        input.style.color = 'var(--color-3)';
        addressDataDiv.classList.remove('form-center');
        addressDataDiv.classList.add('hidden');
      }
    } else {
      input.style.backgroundColor = '';
      input.style.color = '';
      addressDataDiv.classList.remove('form-center');
      addressDataDiv.classList.add('hidden');
    }
  }

  async function reqPostalCode(code) {
    try {
      const postalCodeQuery = await fetch(
        `https://viacep.com.br/ws/${code}/json/`
      );
      const postalCodeData = await postalCodeQuery.json();
      if (postalCodeData.erro) {
        return false;
      }
      document.getElementById('street').textContent = postalCodeData.logradouro;
      document.getElementById('district').textContent = postalCodeData.bairro;
      document.getElementById('city').textContent = postalCodeData.localidade;
      document.getElementById('state').textContent = postalCodeData.uf;
      return true;
    } catch (error) {
      showModalAlert(
        'Alert',
        'CEP inexistente!!',
        'Digite um CEP válido.',
        closeModal
      );
      return false;
    }
  }
}
