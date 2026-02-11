import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle } from 'lucide-react';

const ProgressSteps = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          {/* Step Circle */}
          <div className="flex items-center">
            <motion.div
              initial={false}
              animate={{
                scale: index === currentStep ? 1.1 : 1,
                backgroundColor: index <= currentStep ? '#276073' : '#e5e7eb'
              }}
              className="relative flex items-center justify-center w-10 h-10 rounded-full"
            >
              {index < currentStep ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : index === currentStep ? (
                <div className="w-4 h-4 bg-white rounded-full" />
              ) : (
                <Circle className="w-6 h-6 text-gray-400" />
              )}
            </motion.div>
            
            {/* Step Label */}
            <div className="mr-3 rtl:mr-0 rtl:ml-3 hidden sm:block">
              <p className={`text-sm font-medium ${
                index <= currentStep ? 'text-[#276073]' : 'text-gray-500'
              }`}>
                {step.title}
              </p>
            </div>
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div className="flex-1 mx-4">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: index < currentStep ? '#276073' : '#e5e7eb'
                }}
                className="h-0.5 w-full"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressSteps;