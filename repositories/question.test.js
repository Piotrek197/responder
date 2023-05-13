const { writeFile, rm } = require('fs/promises')
const { faker } = require('@faker-js/faker')
const { makeQuestionRepository } = require('./question')

describe('question repository', () => {
  const TEST_QUESTIONS_FILE_PATH = 'test-questions.json'
  let questionRepo

  beforeAll(async () => {
    questionRepo = makeQuestionRepository(TEST_QUESTIONS_FILE_PATH)
  })

  afterAll(async () => {
    await rm(TEST_QUESTIONS_FILE_PATH)
  })

  beforeEach( async () => {
    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify([]));
  })

  test('should return a list of 0 questions', async () => {
    expect(await questionRepo.getQuestions()).toHaveLength(0)
  })

  test('should return a list of 2 questions', async () => {
    const testQuestions = [
      {
        id: faker.datatype.uuid(),
        summary: 'What is my name?',
        author: 'Jack London',
        answers: []
      },
      {
        id: faker.datatype.uuid(),
        summary: 'Who are you?',
        author: 'Tim Doods',
        answers: []
      }
    ];

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))

    expect(await questionRepo.getQuestions()).toHaveLength(2)
  });

  test("should return a question with given id", async () => {

    const id = faker.datatype.uuid();
    const questions = [
      {
        id,
        summary: 'What is my name?',
        author: 'Jack London',
        answers: []
      },
      {
        id: faker.datatype.uuid(),
        summary: 'Who are you?',
        author: 'Tim Doods',
        answers: []
      }
    ];

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(questions));


    expect(await questionRepo.getQuestionById(id)).toEqual(questions[0]);

  });

  test("should throw an error when question not found", async () => {


    const questions = [
      {
        id: faker.datatype.uuid(),
        summary: 'What is my name?',
        author: 'Jack London',
        answers: []
      },
      {
        id: faker.datatype.uuid(),
        summary: 'Who are you?',
        author: 'Tim Doods',
        answers: []
      }
    ];

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(questions));

    const fakeId = faker.datatype.uuid();
    return expect(() => questionRepo.getQuestionById(fakeId)).rejects.toEqual(new Error("Question does not exist."))
  });


  test("should add a question", async () => {
    
    const question = {
      id: faker.datatype.uuid(),
      author: "Io",
      summary: "test",
      answers: []
    }

    let questions = await questionRepo.getQuestions();
    expect(questions).toHaveLength(0);
    
    await questionRepo.addQuestion(question);

    questions = await questionRepo.getQuestions()
    
    expect(questions).toHaveLength(1);

  });

  test("should get the answers", async () => {

    const questionId = faker.datatype.uuid()
    const questions = [{
      id: questionId,
      author: "Jim Car",
      summary: "this is summary",
      answers: [
        {
          id: faker.datatype.uuid(),
          author: "Jim car",
          summary: "Yes"
        },
        {
          id: faker.datatype.uuid(),
          author: "Jim car",
          summary: "No"
        }
      ]
    }];

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(questions));

    const answers = await questionRepo.getAnswers(questionId);


    expect(answers).toEqual(questions[0].answers);


  });

  test("should throw an error when adding answers to question that does not exist", async () => {

    const questionId = faker.datatype.uuid();

    const questions = [{
      id: faker.datatype.uuid(),
      author: "Jim Car",
      summary: "this is summary",
      answers: [
        {
          id: faker.datatype.uuid(),
          author: "Jim car",
          summary: "Yes"
        },
        {
          id: faker.datatype.uuid(),
          author: "Jim car",
          summary: "No"
        }
      ]
    }];

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(questions));

    const newAnswer = {
      id: faker.datatype.uuid(),
      author: "Mr. Beast",
      summary: "this is summar"
    }

    return expect(() => questionRepo.addAnswer(questionId, newAnswer))
      .rejects.toEqual(new Error("Question does not exist."));

  });


  test("should get a single answer", async () => {

    const answerId = faker.datatype.uuid();
    const questionId = faker.datatype.uuid();
    const questions = [{
      id: questionId,
      author: "Jim Car",
      summary: "this is summary",
      answers: [
        {
          id: answerId,
          author: "Jim car",
          summary: "Yes"
        },
        {
          id: faker.datatype.uuid(),
          author: "Jim car",
          summary: "No"
        }
      ]
    }];


    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(questions));

    const answer = await questionRepo.getAnswer(questionId, answerId);

    expect(answer).toEqual( {
      id: answerId,
      author: "Jim car",
      summary: "Yes"
    });

  });

  test("should throw an error if question not found (select answer)", async () => {

    const answerId = faker.datatype.uuid();
    const questionId = faker.datatype.uuid();
    const questions = [{
      id: faker.datatype.uuid(),
      author: "Jim Car",
      summary: "this is summary",
      answers: [
        {
          id: answerId,
          author: "Jim car",
          summary: "Yes"
        },
        {
          id: faker.datatype.uuid(),
          author: "Jim car",
          summary: "No"
        }
      ]
    }];


    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(questions));

    return expect(() => questionRepo.getAnswer(questionId, answerId)).rejects.toEqual(new Error("Question does not exist."))
  })


  test("should add an answer to question", async () => {

    const questionId = "123";
    const questions = [{
      id: faker.datatype.uuid(),
      author: "Jim Car",
      summary: "this is summary",
      answers: [
        {
          id: faker.datatype.uuid(),
          author: "Jim car",
          summary: "Yes"
        },
        {
          id: faker.datatype.uuid(),
          author: "Jim car",
          summary: "No"
        }
      ]
    }, 
    {
      id: questionId,
      author: "Jim Car",
      summary: "this is summary 1",
      answers: []
    }
  ];

  await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(questions));

  
  const newAnswer = {
    id: faker.datatype.uuid(),
    author: "Mr Anserson",
    summary: "I do not know"
  }
  
  let answers = await questionRepo.getAnswers(questionId);
  expect(answers).toHaveLength(0);

  await questionRepo.addAnswer(questionId, newAnswer);

  answers = await questionRepo.getAnswers(questionId);
  expect(answers).toHaveLength(1);

  })
})
