"use strict";

class Quiz {
  constructor(attachNode) {
    this.quiz = null;
    this.quizResults = null;
    this.currentQuestion = null;
    this.score = 0;
    this.questionNumber = 0;

    this.justStarted = true;

    // Creating HTML elements
    this.initializeQuizDom(attachNode);

    this.getQuizData();
  }

  /**
   * Creates initial DOM elements
   * @param {Element} attachNode
   */
  initializeQuizDom(attachNode) {
    this.title = this.createElement("h1", "quizTitle", "Quiz");
    attachNode.appendChild(this.title);

    this.questionTitle = this.createElement(
      "h2",
      "questionTitle",
      "Question Title"
    );
    attachNode.appendChild(this.questionTitle);

    this.form = this.createElement("form", null, null, null, "quiz");
    attachNode.appendChild(this.form);

    this.image = this.createElement(
      "img",
      "quizImage",
      null,
      "https://via.placeholder.com/150"
    );
    this.form.appendChild(this.image);

    this.answers = this.createElement("div", "answers");
    this.form.appendChild(this.answers);

    this.button = this.createElement("button", "quizSubmitButton", "Let's Go");
    this.form.appendChild(this.button);

    this.button.addEventListener("click", this.submit.bind(this));
  }

  /**
   * Creates an HTML element with attributes
   * @param {string} elementType
   * @param {string} elementClass
   * @param {string} elementContent
   * @param {string} elementSrc
   * @param {string} elementName
   */
  createElement(
    elementType,
    elementClass,
    elementContent,
    elementSrc,
    elementName
  ) {
    const element = document.createElement(elementType);
    if (elementClass) element.classList.add(elementClass);
    if (elementContent) element.innerHTML = elementContent;
    if (elementSrc) element.setAttribute("src", elementSrc);
    if (elementName) element.setAttribute("name", elementName);

    return element;
  }

  /**
   * Sends XMLHttpRequests to get quiz data
   */
  getQuizData() {
    let questionDataRequest = new XMLHttpRequest();
    let resultDataRequest = new XMLHttpRequest();

    questionDataRequest.open(
      "GET",
      "https://raw.githubusercontent.com/smar152/geography-random-trivia-quiz/master/data/geography_questions.json"
    );

    resultDataRequest.open(
      "GET",
      "https://raw.githubusercontent.com/smar152/geography-random-trivia-quiz/master/data/result.json"
    );

    questionDataRequest.onerror = () => {
      this.onLoadError();
    };

    resultDataRequest.onerror = () => {
      this.onLoadError();
    };

    questionDataRequest.onload = () => {
      this.quiz = JSON.parse(questionDataRequest.response);
      this.title.textContent = this.quiz.title;
      this.showQuizStart();
    };

    resultDataRequest.onload = () => {
      this.quizResults = JSON.parse(resultDataRequest.response);
    };

    questionDataRequest.send();
    resultDataRequest.send();
  }

  /**
   * Shows quiz load error
   */
  onLoadError() {
    this.title.classList.add("hidden");
    this.questionTitle.classList.add("hidden");
    this.image.classList.add("hidden");
    this.answers.classList.remove("hidden");
    this.answers.textContent = "Can't load quiz data, sorry :(";
    this.button.classList.add("hidden");
  }

  /**
   * Shows quiz intro
   */
  showQuizStart() {
    this.questionTitle.textContent = this.quiz.description;
    this.image.classList.add("hidden");
    this.answers.classList.add("hidden");
  }

  /**
   * Shows question title, image, answers
   * @param {int} questionNumber
   */
  showQuestion(questionNumber) {
    this.currentQuestion = this.quiz.questions[questionNumber];
    console.log(this.currentQuestion);

    this.questionTitle.textContent = this.currentQuestion.title;
    this.answers.textContent = "";

    this.image.src = this.currentQuestion.img;
    console.log("img src: ", this.image.src);
    this.image.setAttribute("alt", "Image for question");
    this.image.setAttribute("title", "Image for question");

    const isMultipleQuestion = this.currentQuestion.question_type.includes(
      "mutiplechoice"
    );
    if (isMultipleQuestion) {
      let inputType = "checkbox";
      const isSingleQuestion = this.currentQuestion.question_type.includes(
        "single"
      );
      if (isSingleQuestion) {
        inputType = "radio";
      }

      const answers_amount = this.currentQuestion.possible_answers.length;
      for (let i = 0; i < answers_amount; i++) {
        const answerID = this.currentQuestion.possible_answers[i].a_id;
        const answerCaption = this.currentQuestion.possible_answers[i].caption;

        this.createInputWithLabel(
          inputType,
          answerID,
          answerCaption,
          this.answers,
          i
        );
      }
    } else {
      this.currentQuestion.possible_answers = [
        { a_id: false, caption: "False" },
        { a_id: true, caption: "True" },
      ];
      this.createInputWithLabel("radio", "false", "False", this.answers, 0);
      this.createInputWithLabel("radio", "true", "True", this.answers, 1);
    }
    this.button.style.visibility = "visible";
  }

  /**
   * Creates an input with a label and places them under the parent element
   * @param {string} type - the type of the input e.g. "radio"
   * @param {string} answerValue - the value that the input will hold (to be used as an answer)
   * @param {string} text - the text to display in the label
   * @param {HTMLElement} parent- the element where the input and label will be placed
   */
  createInputWithLabel(type, answerValue, text, parent, i) {
    // Div Element

    const div = document.createElement("div");
    parent.appendChild(div);

    const divClass = document.createAttribute("class");
    divClass.value = "answerField";
    div.setAttributeNode(divClass);

    // Input Element

    const input = document.createElement("input");

    const inputType = document.createAttribute("type");
    inputType.value = type;
    input.setAttributeNode(inputType);

    const inputName = document.createAttribute("name");
    inputName.value = "possibleAnswer";
    input.setAttributeNode(inputName);

    const inputValue = document.createAttribute("value");
    inputValue.value = answerValue;
    input.setAttributeNode(inputValue);

    parent.appendChild(div);
    div.appendChild(input);

    // Label Element

    const label = document.createElement("label");
    label.onclick = () => input.click();

    label.textContent = text;

    div.appendChild(label);

    this.currentQuestion.possible_answers[i].inputContainer = div;

    this.currentQuestion.possible_answers[i].inputNode = input;
  }

  /**
   * Checks if user has answered, validates answer
   * @param {event} event - the submit button's click event
   */
  submit(event) {
    event.preventDefault();
    let userHasAnswered = false;

    if (this.justStarted) {
      this.justStarted = false;
      this.showQuestion(0);
      this.image.classList.remove("hidden");
      this.answers.classList.remove("hidden");
    } else {
      const hasRadioButtons =
        this.currentQuestion.question_type.includes("single") ||
        this.currentQuestion.question_type.includes("truefalse");

      //if (hasRadioButtons) {
      const checkedAnswers = this.currentQuestion.possible_answers
        .filter((answer) => answer.inputNode.checked)
        .map((answer) => answer.inputNode.value);

      if (checkedAnswers.length) {
        userHasAnswered = true;
        const radioChoice = checkedAnswers[0].value;

        if (
          checkedAnswers.toString() ==
          this.currentQuestion.correct_answer.toString()
        ) {
          this.onCorrectResponse();
        } else {
          this.onWrongResponse();
        }
      } else {
        console.log("Chose an answer");
      }
    }

    //move on to next question
    if (userHasAnswered) {
      const onTimeoutDone = function () {
        this.answers.classList.remove("success");
        this.showNextQuestion();
      };
      setTimeout(onTimeoutDone.bind(this), 300);
    }
  }

  /**
   * Moves to the next question or the end of the quiz
   */
  showNextQuestion() {
    this.image.classList.remove("imageFailure");
    this.questionNumber++;
    if (this.questionNumber < this.quiz.questions.length) {
      this.showQuestion(this.questionNumber);
    } else {
      this.calculateAndShowResult(this.score);
    }
  }

  /**
   * Shows correct answer feedback
   */
  onCorrectResponse() {
    this.button.style.visibility = "hidden";
    this.answers.textContent = "Huzzuh!";
    this.answers.setAttribute("class", "success");
    this.score += this.currentQuestion.points;
  }

  /**
   * Shows wrong answer feedback
   */
  onWrongResponse() {
    this.image.classList.add("imageFailure");
    this.button.style.visibility = "hidden";

    let correctAnswers = [];

    let amountOfAnswers = this.currentQuestion.correct_answer.length;

    if (!Array.isArray(this.currentQuestion.correct_answer))
      amountOfAnswers = 1;

    let correctAnswer = this.currentQuestion.correct_answer;
    for (let i = 0; i < amountOfAnswers; i++) {
      if (amountOfAnswers > 1)
        correctAnswer = this.currentQuestion.correct_answer[i];
      let currentAnswer = this.currentQuestion.possible_answers
        .filter(
          (answers) => answers.inputNode.value == correctAnswer.toString()
        )
        .map((answer) => answer.inputContainer);

      if (currentAnswer) correctAnswers.push(currentAnswer[0]);
    }

    correctAnswers.forEach((input) => {
      input.classList.add("correctInput");
    });
  }

  /**
   * Calculates final score and shows quiz result
   * @param {int} score
   */
  calculateAndShowResult(score) {
    let totalPoints = 0;
    let finalScore = 0;
    for (let i = 0; i < this.quiz.questions.length; i++) {
      totalPoints += this.quiz.questions[i].points;
    }
    finalScore = (score * 100) / totalPoints;

    let lowerLimit = 0;
    for (let i = 0; i < this.quizResults.results.length; i++) {
      if (
        finalScore >= lowerLimit &&
        finalScore <= this.quizResults.results[i].maxpoints
      ) {
        this.questionTitle.textContent = this.quizResults.results[i].title;
        this.answers.textContent = this.quizResults.results[i].message;

        this.image.src = this.quizResults.results[i].img;
        console.log(this.image.src);

        this.button.style.visibility = "hidden";
      }
      lowerLimit = this.quizResults.results[i].maxpoints + 1;
    }
  }
}

window.onload = main;

function main() {
  const quizAttachNode = document.getElementById("quiz1");
  new Quiz(quizAttachNode);
}
