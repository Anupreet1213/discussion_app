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
    const allQuestions = document.querySelectorAll(".lc-each-question");

    allQuestions.forEach((questionDiv) => {
      const questionId = questionDiv.dataset.index;
      const question = questionsArray.find((q) => q.id === questionId);

      if (question.favourite) {
        numberOfFavourite++;
      }

      if (!isFavoritesView) {
        if (question && !question.favourite) {
          questionDiv.style.display = "none";
        } else {
          questionDiv.style.display = "block";
        }
      } else {
        questionDiv.style.display = "block";
      }
      // console.log(questionElement);
    });
  }

  function renderQuestion(question) {
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("lc-each-question");
    questionDiv.dataset.index = question.id;
    questionDiv.innerHTML = `
      <span class=${
        question.favourite ? "favorite-star-favorited" : "favorite-star"
      }>${question.favourite ? "★" : "☆"}</span>
      <div style="font-size: 1.4rem;">${question.subject}</div>
      <div>${truncateWords(question.question, 10)}</div>
      <span class="question-time" data-id="${question.id}">
        ${getTime(question.createdAt)}
      </span>
      `;
    leftSubContainer.appendChild(questionDiv);
  }

  function getTime(createdAt) {
    const currentTime = Date.now();
    const seconds = Math.floor((currentTime - createdAt) / 1000);

    if (seconds < 60) {
      return `${seconds}s ago`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m ago`;
    } else {
      const hours = Math.floor(seconds / 3600);
      return `${hours}h ago`;
    }
  }

  function updateTimeOfQuestion() {
    const timeSpans = document.querySelectorAll(".question-time");
    timeSpans.forEach((timeSpan) => {
      const questionId = timeSpan.dataset.id;
      const question = questionsArray.find((q) => q.id === questionId);

      if (question) {
        timeSpan.textContent = getTime(question.createdAt);
      }
    });
  }

  setInterval(updateTimeOfQuestion, 1000);

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
      const eachResponseDiv = responses
        .map(
          (response) => `
            <div class="response" data-id=${response.id}>
              <div>
                <h4>${response?.name}</h4>
                <p>${response?.comment}</p>
              </div>
              <div>
                <button class="upvote-btn">
                  <span>(${response.upvote})</span>
                </button>
                <button class="downvote-btn">
                  <span>(${response.downvote})</span>
                </button>
              </div>
            </div>
          `
        )
        .join("");
      rightResponseBox.innerHTML = eachResponseDiv;
    } else {
      rightResponseBox.innerHTML = `<p>No Comments 🦗🦗</p>`;
    }
  }

  function addNewResponse(newResponse, sortedIndex) {
    const newResponseDiv = document.createElement("div");
    newResponseDiv.classList.add("response");
    newResponseDiv.dataset.id = newResponse.id;
    newResponseDiv.innerHTML = `
    <div>
      <h4>${newResponse.name}</h4>
      <p>${newResponse.comment}</p>
    </div>
    <div>
      <button class="upvote-btn"><span>(${newResponse.upvote})</span></button>
      <button class="downvote-btn"><span>(${newResponse.downvote})</span></button>
    </div>
  `;

    const nextResponseDiv =
      sortedIndex + 1 < questionsArray[questionIndexTop].response.length
        ? rightResponseBox.querySelector(
            `.response[data-id="${
              questionsArray[questionIndexTop].response[sortedIndex + 1].id
            }"]`
          )
        : null;

    if (nextResponseDiv) {
      rightResponseBox.insertBefore(newResponseDiv, nextResponseDiv);
    } else {
      rightResponseBox.appendChild(newResponseDiv);
    }
  }

  function generateId() {
    return `${Date.now()}`;
  }

  function filterQuestions(query) {
    // case-sensitive regex
    const regex = new RegExp(query, "i");
    // console.log("hello");

    const highPriority = [];
    const lowPriority = [];

    const questionDiv = leftSubContainer.querySelectorAll(".lc-each-question");

    questionDiv.forEach((eachQuestion) => {
      const questionId = eachQuestion.dataset.index;
      const question = questionsArray.find((q) => q.id === questionId);

      if (isFavoritesView && !question.favourite) {
        eachQuestion.style.display = "none";
        return;
      }

      const subjectElement = eachQuestion.querySelector("div:nth-child(2)");
      const questionElement = eachQuestion.querySelector("div:nth-child(3)");

      if (regex.test(question.subject)) {
        highPriority.push(eachQuestion);
        highlightText(subjectElement, query, regex);
      } else if (regex.test(question.question)) {
        lowPriority.push(eachQuestion);
        highlightText(questionElement, query, regex);
      } else {
        eachQuestion.style.display = "none";
      }
    });

    if (query.trim() === "") {
      if (isFavoritesView) {
        isFavoritesView = !isFavoritesView;
        renderFavouriteQuestion();
        isFavoritesView = !isFavoritesView;
        // console.log("Hello");
      } else {
        while (leftSubContainer.firstChild) {
          leftSubContainer.removeChild(leftSubContainer.lastChild);
        }
        questionsArray.forEach((question) => {
          renderQuestion(question);
        });
      }
      return;
    }

    const sortedQuestions = [...highPriority, ...lowPriority];
    updateDOM(sortedQuestions);
  }

  function updateDOM(sortedQuestions) {
    sortedQuestions.forEach((question) => {
      question.style.display = "block";
      leftSubContainer.appendChild(question);
    });
  }

  function highlightText(element, query, regex) {
    if (!query) return;
    const text = element.textContent;
    const highlightedText = text.replace(regex, (match) => {
      return `<mark style="background-color: yellow;">${match}</mark>`;
    });
    element.innerHTML = highlightedText;
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
      createdAt: Date.now(),
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
    const responseDiv = event.target.closest(".response");

    if (responseDiv) {
      const responseId = responseDiv.dataset.id;
      const responses = questionsArray[questionIndexTop].response;

      const response = responses.find((res) => res.id === responseId);

      if (response) {
        if (upvoteBtn) {
          response.upvote = (response.upvote || 0) + 1;
        } else if (downvoteBtn) {
          response.downvote = (response.downvote || 0) + 1;
        }

        const upvoteSpan = responseDiv.querySelector(".upvote-btn span");
        const downvoteSpan = responseDiv.querySelector(".downvote-btn span");

        if (upvoteSpan) upvoteSpan.textContent = `(${response.upvote})`;
        if (downvoteSpan) downvoteSpan.textContent = `(${response.downvote})`;

        responses.sort(
          (a, b) => b.upvote - b.downvote - (a.upvote - a.downvote)
        );

        rightResponseBox.removeChild(responseDiv);

        const sortedIndex = responses.findIndex((res) => res.id === responseId);
        const nextResponseDiv =
          sortedIndex + 1 < responses.length
            ? rightResponseBox.querySelector(
                `.response[data-id="${responses[sortedIndex + 1].id}"]`
              )
            : null;

        rightResponseBox.insertBefore(responseDiv, nextResponseDiv);

        localStorage.setItem("questions", JSON.stringify(questionsArray));
      }
    }
  });

  leftHeaderInput.addEventListener("input", (event) => {
    const query = event.target.value.trim();
    filterQuestions(query);
  });
});
