import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { RefreshCw } from 'lucide-react';

const generateProblem = () => {
  const numOutcomes = Math.floor(Math.random() * 2) + 3;
  let remainingProbability = 1;
  const distribution = [];
  
  for (let i = 0; i < numOutcomes; i++) {
    const value = Math.floor(Math.random() * 20) - 5;
    let probability;
    
    if (i === numOutcomes - 1) {
      probability = Math.round(remainingProbability * 100) / 100;
    } else {
      probability = Math.round((Math.random() * remainingProbability * 0.8) * 100) / 100;
      remainingProbability -= probability;
    }
    
    distribution.push({ value, probability });
  }
  
  const solution = distribution.reduce((sum, item) => 
    sum + item.value * item.probability, 0
  ).toFixed(2);
  
  const explanation = distribution
    .map(item => `(${item.value} × ${item.probability})`)
    .join(' + ');
  
  return { distribution, solution, explanation };
};

const ExpectedValue = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Answer, setStep1Answer] = useState('');
  const [step2Answer, setStep2Answer] = useState('');
  const [finalAnswer, setFinalAnswer] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [problems, setProblems] = useState([generateProblem()]);
  const [invalidAnswers, setInvalidAnswers] = useState({ step1: false, step2: false, step3: false });

  useEffect(() => {
    setProblems([generateProblem(), generateProblem(), generateProblem()]);
  }, []);

  const checkStep1 = () => {
    const problem = problems[currentProblem];
    
    // Remove optional "E(X) = " prefix and clean the input
    const cleanInput = step1Answer.replace(/^E\(X\)\s*=\s*/, '').trim();
    
    // Create answer array from user input
    const userParts = cleanInput.split('+').map(part => {
      const cleanPart = part.trim().replace(/[()]/g, '');
      const [value, prob] = cleanPart.split(/[×*]/).map(s => s.trim());
      return { value: parseFloat(value), probability: parseFloat(prob) };
    });

    // Create expected array from problem
    const expectedParts = problem.distribution.map(item => ({
      value: item.value,
      probability: item.probability
    }));

    // Compare arrays allowing for different ordering
    const isCorrect = userParts.length === expectedParts.length &&
      userParts.every(userPart => 
        expectedParts.some(expected => 
          Math.abs(userPart.value - expected.value) < 0.01 &&
          Math.abs(userPart.probability - expected.probability) < 0.01
        )
      );

    if (isCorrect) {
      setCurrentStep(2);
      setInvalidAnswers(prev => ({ ...prev, step1: false }));
    } else {
      setInvalidAnswers(prev => ({ ...prev, step1: true }));
    }
  };

  const checkStep2 = () => {
    const problem = problems[currentProblem];
    
    // Remove optional "E(X) = " prefix and clean the input
    const cleanInput = step2Answer.replace(/^E\(X\)\s*=\s*/, '').trim();
    
    // Get individual products from user input and convert to numbers
    const userProducts = cleanInput.split('+')
      .map(num => parseFloat(num.trim()));

    // Calculate expected products
    const expectedProducts = problem.distribution
      .map(item => item.value * item.probability);

    // Compare arrays allowing for different ordering
    const isCorrect = userProducts.length === expectedProducts.length &&
      userProducts.every(userProduct => 
        expectedProducts.some(expected => 
          Math.abs(userProduct - expected) < 0.01
        )
      );

    if (isCorrect) {
      setCurrentStep(3);
      setInvalidAnswers(prev => ({ ...prev, step2: false }));
    } else {
      setInvalidAnswers(prev => ({ ...prev, step2: true }));
    }
  };

  const checkFinalAnswer = () => {
    // Remove optional "E(X) = " prefix and clean the input
    const cleanInput = finalAnswer.replace(/^E\(X\)\s*=\s*/, '').trim();
    const numAnswer = parseFloat(cleanInput);
    
    if (isNaN(numAnswer)) return;
    
    const correct = Math.abs(numAnswer - parseFloat(problems[currentProblem].solution)) < 0.1;
    if (correct) {
      setShowSolution(true);
      setInvalidAnswers(prev => ({ ...prev, step3: false }));
    } else {
      setInvalidAnswers(prev => ({ ...prev, step3: true }));
    }
  };

  const nextProblem = () => {
    if (currentProblem < problems.length - 1) {
      setCurrentProblem(prev => prev + 1);
    } else {
      setProblems(prev => [...prev, generateProblem()]);
      setCurrentProblem(prev => prev + 1);
    }
    setInvalidAnswers({ step1: false, step2: false, step3: false });
    setStep1Answer('');
    setStep2Answer('');
    setFinalAnswer('');
    setShowSolution(false);
    setCurrentStep(1);
  };

  return (
    <div className="bg-gray-100 p-8 w-full max-w-4xl mx-auto">
      <Card className="w-full shadow-md bg-white">
        <div className="bg-sky-50 p-6 rounded-t-lg">
          <h1 className="text-sky-900 text-2xl font-bold">Expected Value</h1>
          <p className="text-sky-800">Master calculating expected values in probability distributions!</p>
        </div>

        <CardContent className="space-y-6 pt-6">
          <div className="bg-blue-50 p-4 rounded border border-blue-200">
            <h2 className="text-blue-900 font-bold mb-2">What is Expected Value?</h2>
            <p className="text-blue-600">
              Expected value (E(X)) is the weighted average of all possible outcomes in a probability distribution. We use this formula to calculate it:
            </p>
            <p className="text-blue-600 font-bold text-center my-2">
              E(X) = Σ(x × P(x))
            </p>
            <p className="text-blue-600">
              For discrete distributions, x is each possible outcome and P(x) is its probability.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Example</h2>
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <p className="text-gray-700 mb-4 mt-6">
                  A game involves rolling a weighted die that produces this probability distribution:
                </p>
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2">Outcome (x)</th>
                        <th className="border border-gray-300 p-2">Probability P(x)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-2">$6</td>
                        <td className="border border-gray-300 p-2">0.1</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2">$4</td>
                        <td className="border border-gray-300 p-2">0.3</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2">-$1</td>
                        <td className="border border-gray-300 p-2">0.6</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="font-bold mb-1">Step 1: Write the formula with the values</p>
                <p className="font-mono mb-4 ml-4">E(X) = ($6 × 0.1) + ($4 × 0.3) + (-$1 × 0.6)</p>
                
                <p className="font-bold mb-1">Step 2: Calculate each product</p>
                <p className="font-mono mb-4 ml-4">E(X) = $0.60 + $1.20 + (-$0.60)</p>
                
                <p className="font-bold mb-1">Step 3: Calculate the final expected value</p>
                <p className="font-mono ml-4">E(X) = $1.20</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-purple-900 font-bold">Practice Time!</h2>
              <Button 
                onClick={nextProblem}
                className="bg-sky-500 hover:bg-sky-600 text-white px-4 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                New Problem
              </Button>
            </div>

            {problems[currentProblem] && (
              <>
                <p className="text-gray-700 mb-4">Calculate the expected value:</p>
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2">Outcome (x)</th>
                        <th className="border border-gray-300 p-2">Probability P(x)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {problems[currentProblem].distribution.map((row, index) => (
                        <tr key={index} className="bg-white">
                          <td className="border border-gray-300 p-2">{row.value}</td>
                          <td className="border border-gray-300 p-2">{row.probability}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-4">
                  <div className="p-4">
                    <p className="font-semibold mb-2">Step 1: Write the formula with the values</p>
                    {currentStep === 1 ? (
                      <div className="flex items-center gap-4">
                        <Input
                          type="text"
                          value={step1Answer}
                          onChange={(e) => {
                            setStep1Answer(e.target.value);
                            setInvalidAnswers(prev => ({ ...prev, step1: false }));
                          }}
                          placeholder="e.g., (6 × 0.1) + (4 × 0.3) + (-1 × 0.6)"
                          className={`flex-1 font-mono ${invalidAnswers.step1 ? 'border-red-500 focus:ring-red-500' : ''}`}
                        />
                        <div className="flex gap-2">
                          <Button 
                            onClick={checkStep1}
                            className="bg-blue-400 hover:bg-blue-500"
                          >
                            Check
                          </Button>
                          <Button
                            onClick={() => {
                              const formula = problems[currentProblem].distribution
                                .map(item => `(${item.value} × ${item.probability})`)
                                .join(' + ');
                              setStep1Answer(formula);
                              setCurrentStep(2);
                            }}
                            className="bg-gray-400 hover:bg-gray-500"
                          >
                            Skip
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="font-mono text-green-600 font-bold">
                        E(X) = {problems[currentProblem].distribution
                          .map(item => `(${item.value} × ${item.probability})`)
                          .join(' + ')}
                      </p>
                    )}
                  </div>

                  {currentStep >= 2 && (
                    <div className="p-4">
                      <p className="font-semibold mb-2">Step 2: Calculate each product</p>
                      {currentStep === 2 ? (
                        <div className="flex items-center gap-4">
                          <Input
                            type="text"
                            value={step2Answer}
                            onChange={(e) => {
                            setStep2Answer(e.target.value);
                            setInvalidAnswers(prev => ({ ...prev, step2: false }));
                          }}
                            placeholder="e.g., 0.60 + 1.20 + (-0.60)"
                            className={`flex-1 font-mono ${invalidAnswers.step2 ? 'border-red-500 focus:ring-red-500' : ''}`}
                          />
                          <div className="flex gap-2">
                            <Button 
                              onClick={checkStep2}
                              className="bg-blue-400 hover:bg-blue-500"
                            >
                              Check
                            </Button>
                            <Button
                              onClick={() => {
                                const products = problems[currentProblem].distribution
                                  .map(item => `${(item.value * item.probability).toFixed(2)}`)
                                  .join(' + ');
                                setStep2Answer(products);
                                setCurrentStep(3);
                              }}
                              className="bg-gray-400 hover:bg-gray-500"
                            >
                              Skip
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="font-mono text-green-600 font-bold">
                        E(X) = {problems[currentProblem].distribution
                          .map(item => (item.value * item.probability).toFixed(2))
                          .join(' + ')}
                      </p>
                      )}
                    </div>
                  )}

                  {currentStep >= 3 && (
                    <div className="p-4">
                      <p className="font-semibold mb-2">Step 3: Calculate the final expected value</p>
                      {!showSolution ? (
                        <div className="flex items-center gap-4">
                          <Input
                            type="number"
                            step="0.1"
                            value={finalAnswer}
                            onChange={(e) => {
                            setFinalAnswer(e.target.value);
                            setInvalidAnswers(prev => ({ ...prev, step3: false }));
                          }}
                            placeholder="e.g., 1.20"
                            className={`flex-1 font-mono ${invalidAnswers.step3 ? 'border-red-500 focus:ring-red-500' : ''}`}
                          />
                          <div className="flex gap-2">
                            <Button 
                              onClick={checkFinalAnswer}
                              className="bg-blue-400 hover:bg-blue-500"
                            >
                              Check
                            </Button>
                            <Button
                              onClick={() => {
                                setFinalAnswer(problems[currentProblem].solution);
                                setShowSolution(true);
                              }}
                              className="bg-gray-400 hover:bg-gray-500"
                            >
                              Skip
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="font-mono text-green-600 font-bold">E(X) = {parseFloat(problems[currentProblem].solution).toFixed(2)}</p>
                      )}
                    </div>
                  )}

                  {showSolution && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                      <h3 className="text-green-800 text-xl font-bold mb-2">Great Work!</h3>
                      <p className="text-green-700">You've successfully calculated the expected value!</p>
                      <Button 
                        onClick={nextProblem}
                        className="mt-4 bg-sky-500 hover:bg-sky-600 text-white"
                      >
                        Try Another Problem
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      <p className="text-center text-gray-600 mt-4">
        Understanding expected value is crucial for probability and statistics!
      </p>
    </div>
  );
};

export default ExpectedValue;