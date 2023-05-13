const { readFile, writeFile } = require('fs/promises')

const makeQuestionRepository = fileName => {
  const getQuestions = async () => {
    const fileContent = await readFile(fileName, { encoding: 'utf-8' })
    const questions = JSON.parse(fileContent)

    return questions;
  }

  const getQuestionById = async questionId => {
    const questions = await getQuestions();
    const question = questions.find(question => question.id === questionId);

    if(!question) throw new Error("Question does not exist.")

    return question;

  }
  const addQuestion = async question => {
    const questions = await getQuestions();
    
    await writeFile(fileName, JSON.stringify([...questions, question]));

  }
  const getAnswers = async questionId => {

    const question = await getQuestionById(questionId);

    if(!question) throw new Error("Question with given id does not exist.");

    return question.answers;
  }
  const getAnswer = async (questionId, answerId) => {

    const answers = await getAnswers(questionId);

    const answer = answers.find(a => a.id === answerId);

    if(!answer) throw new Error("Answer with given id doesn't exist.");

    return answer;

  }
  const addAnswer = async (questionId, answer) => {

    const questions = await getQuestions();
    const answers = await getAnswers(questionId);

    const editedAnswers = [...answers, answer];

    const editedQuestions = questions.map(question => question.id === questionId ? {...question, answers: editedAnswers} : question);

    await writeFile(fileName, JSON.stringify(editedQuestions));
    
  }

  return {
    getQuestions,
    getQuestionById,
    addQuestion,
    getAnswers,
    getAnswer,
    addAnswer
  }
}

module.exports = { makeQuestionRepository }
