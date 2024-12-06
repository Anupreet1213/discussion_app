document.addEventListener("DOMContentLoaded", () => {
  let clickElementTop = null;
  let questionIndexTop = null;
  const questionsArray = JSON.parse(localStorage.getItem("questions")) || [];
  const form = document.getElementById("question-form");

  const leftContainer = document.getElementById("left-container");
  const leftSubContainer = document.getElementById("lc-sub-container");
  const rightResSubContainer = document.getElementById(
    "right-res-sub-container"
  );
  const leftHeaderButton = document.querySelector(".lc-header-btn");
  const rightResContentBox = document.querySelector(".rc-res-question-content");
  const rcResQuestionBtn = document.querySelector(".rc-res-question-btn");
  const leftHeaderInput = document.querySelector(".lc-header-input");

  const rightResponseForm = document.getElementById("right-res-form");
  const rightResponseBox = document.querySelector(".rc-res-response-box");

  const favouritesButton = document.querySelector(".favourites-btn");
  // const leftEachQuestion = document.querySelector(".lc-each-question");

  let isFavoritesView = false;
  let numberOfFavourite = 0;

  function checkForAnyFavourite() {
    const hasFavourites = questionsArray.some((q) => q.favourite);
    return hasFavourites;
  }

  function updateFavouritesButtonState() {
    const hasFavourites = checkForAnyFavourite();
    if (!hasFavourites) {
      favouritesButton.disabled = true;
      favouritesButton.innerText = "No Favourites";
      favouritesButton.style = "opacity: 0.6; cursor: not-allowed";
      isFavoritesView = false;
    } else if (!isFavoritesView) {
      favouritesButton.disabled = false;
      favouritesButton.innerText = "Favourites";
      favouritesButton.style = "opacity: 1";
    } else {
      favouritesButton.disabled = false;
      favouritesButton.innerText = "Show All";
      favouritesButton.style = "opacity: 1";
    }
  }

  function renderFavouriteQuestion() {
    const allQuestionElements = document.querySelectorAll(".lc-each-question");

    allQuestionElements.forEach((questionElement) => {
      // console.log(questionElement);

      const questionId = questionElement.dataset.index;
      const question = questionsArray.find((q) => q.id === questionId);

      if (question.favourite) {
        numberOfFavourite++;
      }

      if (!isFavoritesView) {
        if (question && !question.favourite) {
          questionElement.style.display = "none";
        } else {
          questionElement.style.display = "block";
        }
      } else {
        questionElement.style.display = "block";
      }
    });
  }

  function renderQuestion(question) {
    const questionElement = document.createElement("div");
    questionElement.classList.add("lc-each-question");
    questionElement.dataset.index = question.id;
    questionElement.innerHTML = `
      <span class=${
        question.favourite ? "favorite-star-favorited" : "favorite-star"
      }>${question.favourite ? "★" : "☆"}</span>
      <div style="font-size: 1.4rem;">${question.subject}</div>
      <div>${truncateWords(question.question, 10)}</div>
      `;
    leftSubContainer.appendChild(questionElement);
  }

  function truncateWords(text, limit) {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length > limit) {
      return words.slice(0, limit).join(" ") + "...";
    }
    return text;
  }

  function renderQuestionWithResponse(question) {
    const questionElement = `
        <h4>${question?.subject}</h4>
        <p>${question?.question}</p>
      `;
    rightResContentBox.innerHTML = questionElement;
  }

  function renderResponse(responses) {
    if (responses && responses.length > 0) {
      const responseElements = responses
        .map(
          (response) => `
            <div class="response" data-id=${response.id}>
              <div>
                <h4>${response?.name}</h4>
                <p>${response?.comment}</p>
              </div>
              <div>
                <button class="upvote-btn">
                  <span>Upvote (${response.upvote})</span>
                </button>
                <button class="downvote-btn">
                  <span>Downvote (${response.downvote})</span>
                </button>
              </div>
            </div>
          `
        )
        .join("");
      rightResponseBox.innerHTML = responseElements;
    } else {
      rightResponseBox.innerHTML = `<p>No Comments 🦗🦗</p>`;
    }
  }

  function addNewResponse(newResponse, sortedIndex) {
    const newResponseElement = document.createElement("div");
    newResponseElement.classList.add("response");
    newResponseElement.dataset.id = newResponse.id;
    newResponseElement.innerHTML = `
    <div>
      <h4>${newResponse.name}</h4>
      <p>${newResponse.comment}</p>
    </div>
    <div>
      <button class="upvote-btn"><span>Upvote (${newResponse.upvote})</span></button>
      <button class="downvote-btn"><span>Downvote (${newResponse.downvote})</span></button>
    </div>
  `;

    const nextElement =
      sortedIndex + 1 < questionsArray[questionIndexTop].response.length
        ? rightResponseBox.querySelector(
            `.response[data-id="${
              questionsArray[questionIndexTop].response[sortedIndex + 1].id
            }"]`
          )
        : null;

    if (nextElement) {
      rightResponseBox.insertBefore(newResponseElement, nextElement);
    } else {
      rightResponseBox.appendChild(newResponseElement);
    }
  }

  function generateId() {
    return `${Date.now()}`;
  }

  function filterQuestions(query) {
    const regex = new RegExp(query, "i");

    const questionElements =
      leftSubContainer.querySelectorAll(".lc-each-question");

    questionElements.forEach((questionElement) => {
      const questionId = questionElement.dataset.index;
      const question = questionsArray.find((q) => q.id === questionId);

      if (
        question &&
        (regex.test(question.question) || regex.test(question.subject))
      ) {
        questionElement.style.display = "block";
      } else {
        questionElement.style.display = "none";
      }
    });

    // const filteredQuestions = questionsArray.filter(
    //   (question) =>
    //     regex.test(question.question) || regex.test(question.subject)
    // );

    // leftSubContainer.innerHTML = "";

    // filteredQuestions.forEach((question) => {
    //   renderQuestion(question);
    // });
  }

  questionsArray.forEach((eachQuestion) => {
    renderQuestion(eachQuestion);
  });
  updateFavouritesButtonState();

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const subject = form.subject.value.trim();
    const question = form.question.value.trim();

    if (!subject || !question) {
      alert("Please fill out both fields.");
      return;
    }

    const newQuestion = {
      id: generateId(),
      subject,
      question,
      response: [],
      favourite: false,
    };
    questionsArray.push(newQuestion);

    localStorage.setItem("questions", JSON.stringify(questionsArray));

    renderQuestion(newQuestion);

    form.reset();
  });

  leftContainer.addEventListener("click", (event) => {
    const clickElement = event.target.closest(".lc-each-question");
    const iconClickElement = event.target.closest(
      ".favorite-star, .favorite-star-favorited"
    );

    if (iconClickElement) {
      const questionId = iconClickElement.parentElement.dataset.index;
      const question = questionsArray.find((q) => q.id === questionId);

      question.favourite = !question.favourite;

      // console.log(question.favourite);
      // console.log(numberOfFavourite);
      // if (question.favourite) {
      //   numberOfFavourite++;
      // } else {
      //   numberOfFavourite--;
      // }
      // // numberOfFavourite += question.favourite ? 1 : -1;
      // console.log(numberOfFavourite);

      iconClickElement.className = question.favourite
        ? "favorite-star-favorited"
        : "favorite-star";
      iconClickElement.textContent = question.favourite ? "★" : "☆";
      localStorage.setItem("questions", JSON.stringify(questionsArray));

      // if (isFavoritesView && numberOfFavourite === 0) {
      //   isFavoritesView = false;
      //   renderFavouriteQuestion();
      // }

      if (isFavoritesView && !question.favourite) {
        const questionElement = document.querySelector(
          `.lc-each-question[data-index="${questionId}"]`
        );

        if (questionElement) {
          questionElement.style.display = "none";
        }

        // console.log(numberOfFavourite);
      }

      if (isFavoritesView && !checkForAnyFavourite()) {
        renderFavouriteQuestion();
        isFavoritesView = !isFavoritesView;
      }

      updateFavouritesButtonState();
    } else if (clickElement) {
      const id = clickElement.dataset.index;

      const question = questionsArray.find((q) => q.id === id);
      const questionIndex = questionsArray.findIndex((q) => q.id === id);

      renderQuestionWithResponse(question);
      form.style = "display: none;";
      rightResSubContainer.style = "display: flex;";

      clickElementTop = clickElement;
      questionIndexTop = questionIndex;

      renderResponse(question.response);
    }
  });

  //Delete Button
  rcResQuestionBtn.addEventListener("click", () => {
    if (questionIndexTop !== null) {
      questionsArray.splice(questionIndexTop, 1);
      localStorage.setItem("questions", JSON.stringify(questionsArray));

      clickElementTop.remove();

      rightResSubContainer.style = "display: none";
      form.style = "display: flex";
    }
  });

  leftHeaderButton.addEventListener("click", () => {
    rightResSubContainer.style = "display: none";
    form.style = "display: flex";
  });

  rightResponseForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = rightResponseForm.name.value.trim();
    const comment = rightResponseForm.comment.value.trim();

    if (!name || !comment) {
      alert("Please fill out both fields.");
      return;
    }

    const newResponse = {
      id: generateId(),
      name,
      comment,
      upvote: 0,
      downvote: 0,
    };

    if (!questionsArray[questionIndexTop].response) {
      questionsArray[questionIndexTop].response = [];
    }

    questionsArray[questionIndexTop].response.push(newResponse);

    const sortedIndex = questionsArray[questionIndexTop].response
      .sort((a, b) => b.upvote - b.downvote - (a.upvote - a.downvote))
      .findIndex((res) => res.id === newResponse.id);

    localStorage.setItem("questions", JSON.stringify(questionsArray));

    if (questionsArray[questionIndexTop].response.length === 1) {
      renderResponse(questionsArray[questionIndexTop].response);
    } else {
      addNewResponse(newResponse, sortedIndex);
    }

    rightResponseForm.reset();
  });

  favouritesButton.addEventListener("click", () => {
    if (!favouritesButton.disabled) {
      renderFavouriteQuestion();
      isFavoritesView = !isFavoritesView;
      updateFavouritesButtonState();
    }
  });

  //handles upvote & downvote
  rightResponseBox.addEventListener("click", (event) => {
    const upvoteBtn = event.target.closest(".upvote-btn");
    const downvoteBtn = event.target.closest(".downvote-btn");
    const responseElement = event.target.closest(".response");

    if (responseElement) {
      const responseId = responseElement.dataset.id;
      const responses = questionsArray[questionIndexTop].response;

      const response = responses.find((res) => res.id === responseId);

      if (response) {
        if (upvoteBtn) {
          response.upvote = (response.upvote || 0) + 1;
        } else if (downvoteBtn) {
          response.downvote = (response.downvote || 0) + 1;
        }

        const upvoteSpan = responseElement.querySelector(".upvote-btn span");
        const downvoteSpan =
          responseElement.querySelector(".downvote-btn span");

        if (upvoteSpan) upvoteSpan.textContent = `Upvote (${response.upvote})`;
        if (downvoteSpan)
          downvoteSpan.textContent = `Downvote (${response.downvote})`;

        responses.sort(
          (a, b) => b.upvote - b.downvote - (a.upvote - a.downvote)
        );

        rightResponseBox.removeChild(responseElement);

        const sortedIndex = responses.findIndex((res) => res.id === responseId);
        const nextElement =
          sortedIndex + 1 < responses.length
            ? rightResponseBox.querySelector(
                `.response[data-id="${responses[sortedIndex + 1].id}"]`
              )
            : null;

        rightResponseBox.insertBefore(responseElement, nextElement);

        localStorage.setItem("questions", JSON.stringify(questionsArray));
      }
    }
  });

  leftHeaderInput.addEventListener("input", (event) => {
    const query = event.target.value.trim();
    filterQuestions(query);
  });
});
