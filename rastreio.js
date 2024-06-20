document.addEventListener("DOMContentLoaded", function () {
  const rastreiosElement = document.getElementById("rastreios");
  const formContainer = document.querySelector(".modal-container");

  // Função para calcular o progresso com base no status
  function calculateProgress(status) {
    const progressMap = {
      "Aguardando liberação": 10,
      "Postado": 25,
      "Em transito": 50,
      "Aguardando retirada": 75,
      "Entregue": 100
    };
    return progressMap[status] || 0;
  }

  // Função para criar a barra de progresso com base no percentual de progresso
  function createProgressBar(progressPercentage) {
    const progressBar = document.createElement("div");
    progressBar.classList.add("progress-bar");

    const progress = document.createElement("div");
    progress.classList.add("progress");
    progress.style.width = `${progressPercentage}%`;

    const colorMap = {
      10: "#00CED1",
      25: "#ff4500",
      50: "#ffa500",
      75: "#ffd700",
      100: "#32cd32"
    };

    progress.style.backgroundColor = colorMap[progressPercentage] || "#808080";
    progressBar.appendChild(progress);

    return progressBar;
  }

  // Função para criar a informação do objeto de rastreamento
  function createObjectInfo(object) {
    const info = document.createElement("div");
    info.classList.add("info");

    const id = document.createElement("p");
    id.textContent = `ID de rastreio: ${object.id}`;

    const empresaId = document.createElement("p");
    empresaId.textContent = `ID da empresa: ${object.empresaId}`;

    const postDate = document.createElement("p");
    postDate.textContent = `Postagem: ${object.postDate}`;

    const deliveryDate = document.createElement("p");
    deliveryDate.textContent = `Entregue: ${object.deliveryDate}`;

    info.append(id, empresaId, postDate, deliveryDate);

    return info;
  }

  // Função para criar o seletor de status do objeto de rastreamento
  function createStatusSelect(currentStatus, onChange) {
    const select = document.createElement("select");
    select.classList.add("status-select");

    const statuses = ["Aguardando liberação", "Postado", "Em transito", "Aguardando retirada", "Entregue"];
    statuses.forEach(status => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      if (status === currentStatus) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    select.addEventListener("change", function(event) {
      const newStatus = event.target.value;
      onChange(newStatus);
    });

    return select;
  }

  // Função para criar uma notificação na tela
  function createNotification(message) {
    const notification = document.createElement("div");
    notification.classList.add("notification");
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("show");
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }, 100);
  }

  // Função para adicionar um novo objeto de rastreamento à lista
  function addObjectToList(object) {
    const li = document.createElement("li");
    li.classList.add("object");

    const img = document.createElement("img");
    img.src = "img/image48.png";
    img.classList.add("truck");

    const info = createObjectInfo(object);
    const progressBar = createProgressBar(calculateProgress(object.status));
    const select = createStatusSelect(object.status, function (newStatus) {
      object.status = newStatus;
      // Aqui você pode adicionar lógica para salvar os dados em localStorage se necessário
      // saveDataToLocalStorage(initialData);
      // Exibir os dados atualizados
      displayData(initialData);
      createNotification(`Status do rastreio ${object.id} alterado para ${newStatus}`);
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.title = "Excluir";
    deleteButton.addEventListener("click", function () {
      const index = initialData.findIndex(item => item.id === object.id);
      if (index !== -1) {
        initialData.splice(index, 1);
        // Aqui você pode adicionar lógica para salvar os dados em localStorage se necessário
        // saveDataToLocalStorage(initialData);
        // Exibir os dados atualizados
        displayData(initialData);
        createNotification(`Rastreio ${object.id} excluído com sucesso`);
      }
    });

    const deleteIcon = document.createElement("img");
    deleteIcon.src = "img/remove.png";
    deleteIcon.alt = "Lixeira";
    deleteButton.appendChild(deleteIcon);

    info.appendChild(select);
    li.append(img, info, progressBar, deleteButton);
    rastreiosElement.appendChild(li);
  }

  // Função para exibir os dados na lista de rastreios
  function displayData(dataArray) {
    rastreiosElement.innerHTML = "";
    dataArray.forEach(addObjectToList);
  }

  // Função para obter os dados salvos no localStorage
  function getDataFromLocalStorage() {
    return JSON.parse(localStorage.getItem('rastreios')) || [];
  }

  // Função para salvar os dados no localStorage
  function saveDataToLocalStorage(data) {
    localStorage.setItem('rastreios', JSON.stringify(data));
  }

  // Obtém os dados iniciais do localStorage ou um array vazio se não houver dados
  const initialData = getDataFromLocalStorage();

  // Exibe os dados iniciais na página
  displayData(initialData);

  // Captura do formulário de adição de rastreamento
  document.getElementById('add-tracking').addEventListener('submit', function(e) {
    e.preventDefault();

    // Captura dos valores dos campos do formulário
    const id = document.getElementById('add-id').value;
    const empresaId = document.getElementById('add-company').value; // Captura do ID da empresa
    const postDate = document.getElementById('add-post').value;
    const deliveryDate = document.getElementById('add-delivery').value;
    const status = document.getElementById('statusFilter').value; // Valor padrão para o status

    // Cria um novo objeto de rastreamento
    const rastreio = { id, empresaId, postDate, deliveryDate, status };

    // Adiciona o novo objeto ao array inicialData
    initialData.push(rastreio);

    // Salva os dados atualizados no localStorage
    saveDataToLocalStorage(initialData);

    // Exibe os dados atualizados na página
    displayData(initialData);

    // Limpa o formulário após a submissão
    this.reset();

    // Esconde o formulário de adição
    formContainer.style.display = 'none';

    // Cria uma notificação para informar que o rastreamento foi adicionado com sucesso
    createNotification(`Rastreio ${id} adicionado com sucesso`);
  });

  // Filtragem de rastreios por ID ao digitar no campo de busca
  document.querySelector("#searchInput").addEventListener("keyup", (e) => {
    const search = initialData.filter(i =>
      i.id.toLowerCase().includes(e.target.value.toLowerCase())
    );
    displayData(search);
  });

  // Filtragem de rastreios por status ao selecionar no campo de filtro de status
  document.querySelector("#statusFilter").addEventListener("change", (e) => {
    const status = e.target.value;
    const filteredData = status
      ? initialData.filter(item => item.status === status)
      : initialData;
    displayData(filteredData);
  });

  // Mostrar ou esconder o formulário de adição ao clicar no botão "add-button"
  document.getElementById("add-button").addEventListener("click", () => {
    formContainer.style.display = formContainer.style.display === "flex" ? "none" : "flex";
  });

  // Fechar o formulário de adição ao clicar no botão "Close"
  document.getElementById("close").addEventListener("click", (e) => {
    e.preventDefault();
    formContainer.style.display = "none";
  });
});
