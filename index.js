const express = require('express')
const { urlencoded, json } = require('body-parser')
const makeRepositories = require('./middleware/repositories')
const { v4: uuidv4 } = require('uuid');

const STORAGE_FILE_PATH = 'questions.json'
const PORT = 3000

const app = express()

app.use(urlencoded({ extended: true }))
app.use(json())
app.use(makeRepositories(STORAGE_FILE_PATH))

app.get('/', (_, res) => {
  res.json({ message: 'Welcome to responder!' })
})

app.get('/questions', async (req, res) => {
  const questions = await req.repositories.questionRepo.getQuestions()
  res.json(questions)
})

app.get('/questions/:questionId', async (req, res) => {
  const questionId = req?.params?.questionId;

  try {
    const question = await req.repositories.questionRepo.getQuestionById(questionId);
    res.json(question);
  }catch(err){
    res.status(403).json({message: err.message});
  }

})

app.post('/questions', async (req, res) => {

  const {author, summary, answers} = req.body;

  //author and summary should be required
  if(!author || !summary) return res.status(400).json({message: "Author and summary are required"});
  
  const newQuestion = {id: uuidv4(), author, summary, answers: Array.isArray(answers) && answers ? answers : []};

  try {
    await req.repositories.questionRepo.addQuestion(newQuestion);
    res.status(201).json({message: "A question has been created."});
  }catch(err){
    res.status(500).json({message: "Something is wrong." + err.message});
  }

})

app.get('/questions/:questionId/answers', async (req, res) => {

  try {
    const answers = await req.repositories.questionRepo.getAnswers(req?.params?.questionId);
    res.json(answers);
  }catch(err){
    res.status(403).json({message: err.message});
  }
})

app.post('/questions/:questionId/answers', async (req, res) => {

  const {author, summary} = req.body;
  const {questionId} = req.params;

   //author and summary should be required
   if(!author || !summary) return res.status(400).json({message: "Author and summary are required"});

  const newAnswer = {id: uuidv4(), author, summary};

  try {
    await req.repositories.questionRepo.addAnswer(questionId, newAnswer);
    res.status(201).json({message: "An answer has been created."});
  }catch(err){
    res.status(500).json({message: "Something is wrong." + err.message});
  }
})

app.get('/questions/:questionId/answers/:answerId', async (req, res) => {

  try {
    const answer = await req.repositories.questionRepo.getAnswer(req?.params?.questionId, req?.params?.answerId);
    res.json(answer);
  
  }catch(err){
    res.status(403).json({message: err.message});
  }
})

app.get('/*', (req, res) => {
  res.status(404).json({message: "Couldn't find a page"});
})

app.listen(PORT, () => {
  console.log(`Responder app listening on port ${PORT}`)
})
