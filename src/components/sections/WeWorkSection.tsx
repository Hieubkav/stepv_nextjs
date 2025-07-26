'use client';

import { useState, useEffect } from 'react';

interface WorkStep {
  title: string;
  description: string;
  icon: string;
}

interface WeWorkSectionProps {
  title?: string;
  subtitle?: string;
  steps?: WorkStep[];
}

const WeWorkSection = ({
  title = 'How We Work',
  subtitle = 'Our streamlined process ensures exceptional results every time. From concept to final delivery, we work closely with you to bring your vision to life.',
  steps = [
    {
      title: 'Discovery & Planning',
      description: 'We start by understanding your brand, goals, and vision to create the perfect strategy.',
      icon: 'fa-lightbulb'
    },
    {
      title: 'Concept Development',
      description: 'Our team develops creative concepts and presents initial ideas for your approval.',
      icon: 'fa-pencil-ruler'
    },
    {
      title: '3D Production',
      description: 'We bring your vision to life with cutting-edge 3D modeling and rendering technology.',
      icon: 'fa-cube'
    },
    {
      title: 'Final Delivery',
      description: 'High-quality final assets delivered in your preferred format, ready for use.',
      icon: 'fa-check-circle'
    }
  ]
}: WeWorkSectionProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const uniqueId = 'we-work-' + Math.random().toString(36).substr(2, 9);

  // Auto-rotate steps every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [steps.length]);

  const handleStepClick = (stepIndex: number) => {
    setActiveStep(stepIndex);
  };

  // Calculate positions for dots around the circle
  const getStepPosition = (index: number, total: number) => {
    const angle = (index * 360) / total - 90; // Start from top
    const radius = 45; // Percentage from center
    const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
    const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
    return { x, y };
  };

  return (
    <section className="py-20 bg-black text-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
            {title}
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Interactive Circle */}
        <div className="max-w-4xl mx-auto">
          <div className="relative aspect-square max-w-lg mx-auto">
            {/* Main Circle */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-2xl">
              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-10 lg:p-16">
                <div className="mb-4 text-white text-4xl lg:text-6xl">
                  <i className={`fa ${steps[activeStep]?.icon || 'fa-star'}`}></i>
                </div>
                <h3 className="text-white text-xl lg:text-2xl uppercase leading-tight mb-4">
                  {steps[activeStep]?.title || 'Step Title'}
                </h3>
                <p className="text-gray-300 font-light text-sm lg:text-base leading-relaxed">
                  {steps[activeStep]?.description || 'Step description'}
                </p>
              </div>

              {/* Step Dots */}
              {steps.map((step, index) => {
                const position = getStepPosition(index, steps.length);
                return (
                  <button
                    key={index}
                    className={`absolute w-4 h-4 rounded-full border-2 transition-all duration-300 cursor-pointer hover:scale-125 ${
                      activeStep === index
                        ? 'bg-white border-white shadow-lg shadow-white/50'
                        : 'bg-gray-600 border-gray-500 hover:bg-gray-500'
                    }`}
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    onClick={() => handleStepClick(index)}
                    aria-label={`Step ${index + 1}: ${step.title}`}
                  />
                );
              })}

              {/* Connecting Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {steps.map((_, index) => {
                  const currentPos = getStepPosition(index, steps.length);
                  const nextPos = getStepPosition((index + 1) % steps.length, steps.length);
                  
                  return (
                    <line
                      key={index}
                      x1={`${currentPos.x}%`}
                      y1={`${currentPos.y}%`}
                      x2={`${nextPos.x}%`}
                      y2={`${nextPos.y}%`}
                      stroke="rgba(156, 163, 175, 0.3)"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                    />
                  );
                })}
              </svg>
            </div>

            {/* Decorative Rings */}
            <div className="absolute inset-4 rounded-full border border-gray-700/50"></div>
            <div className="absolute inset-8 rounded-full border border-gray-600/30"></div>
          </div>

          {/* Step Indicators Below */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {steps.map((step, index) => (
              <button
                key={index}
                className={`p-4 rounded-lg border transition-all duration-300 text-left ${
                  activeStep === index
                    ? 'bg-white/10 border-white text-white'
                    : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-700/50'
                }`}
                onClick={() => handleStepClick(index)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    activeStep === index ? 'bg-white text-black' : 'bg-gray-600 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium text-sm">{step.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FontAwesome Icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />

      {/* Custom Styles */}
      <style jsx>{`
        /* Smooth transitions */
        .transition-all {
          will-change: transform, background-color, border-color;
        }

        /* Pulse animation for active step */
        .shadow-yellow-500\\/50 {
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(234, 179, 8, 0);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .aspect-square {
            max-width: 300px;
          }
          
          .inset-10 {
            inset: 2rem;
          }
          
          .lg\\:p-16 {
            padding: 1.5rem;
          }
        }
      `}</style>
    </section>
  );
};

export default WeWorkSection;
