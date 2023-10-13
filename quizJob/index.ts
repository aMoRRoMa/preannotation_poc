import OpenAI from 'openai'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
if (OPENAI_API_KEY === undefined) throw new Error('Please provide an API key')

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const readFile = async (path: string) => {
  const file = Bun.file(path);
  
  const text = await file.text();
  return text
}

const instructions = await readFile('quizJob/instructions.html')
const form = await readFile('quizJob/quizForm.html')

const negativeTweet = await readFile('quizJob/negative.txt')
const positiveTweet = await readFile('quizJob/positive.txt')
const neutralTweet = await readFile('quizJob/neutral.txt')

try {
  const results = await Promise.allSettled([negativeTweet, positiveTweet, neutralTweet].map((tweet) => {
    return openai.chat.completions.create({
      messages: [
        { role: "user", content: "Hello, I need you to fill a form follow next instructions" },
        { role: "user", content: instructions },
        { role: "user", content: `This is a form: ${form}`},
        { role: "user", content: `Please fill the form for that tweet: ${tweet}`},
        { role: "user", content: 'Please format your answer as a json object like { [input name]: input value }'}
      ],
      model: "gpt-3.5-turbo",
    })
  }))
  results.forEach((result: PromiseSettledResult<OpenAI.Chat.Completions.ChatCompletion>) => {
    if (result.status === 'fulfilled') {
      console.log('result: ', result.value.choices[0].message.content)
    }
  })
} catch (e) {
  console.log('error: ', e)
}
