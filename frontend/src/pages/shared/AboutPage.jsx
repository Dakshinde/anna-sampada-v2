import React from 'react';
import { Leaf, Heart, Users, Lightbulb, Wind } from 'lucide-react';

const teamMembers = [
  { name: 'Daksh Shinde', role: 'Team Member' },
  { name: 'Shivam Singh', role: 'Team Member' },
  { name: 'Parth Shelar', role: 'Team Member' },
  { name: 'Rishita Singh', role: 'Team Member' },
];

const values = [
  {
    icon: <Leaf className="w-8 h-8 text-green-500" />,
    title: 'Stop Wasting Food',
    description:
      'A lot of food goes to waste every day — especially when there is more than needed. We built AnnaSampada to help manage that surplus so it actually reaches someone who needs it.',
  },
  {
    icon: <Heart className="w-8 h-8 text-rose-500" />,
    title: 'Respect Your Food',
    description:
      'Food is not just something we eat — it gives our body the energy to do everything. We believe food deserves respect, and wasting it is something we should all try to avoid.',
  },
  {
    icon: <Lightbulb className="w-8 h-8 text-amber-500" />,
    title: 'Manage It Better',
    description:
      'With the right tools, food can be managed more efficiently — donated before it spoils, composted when needed, and tracked so nothing goes unnoticed.',
  },
  {
    icon: <Wind className="w-8 h-8 text-cyan-500" />,
    title: 'IoT Digital Nose',
    description:
      'We use advanced IoT sensors to detect invisible gas markers like Ammonia and Methane, providing an objective "digital nose" that identifies spoilage before it’s visible.',
  },
];

const AboutPage = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Header */}
        <div className="text-center mb-16 animate-slide-down">
          <h1 className="text-5xl md:text-6xl font-extrabold text-green-700 dark:text-green-300 mb-4">
            About AnnaSampada
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            A semester project by students of{' '}
          <a
            href="https://slrtce.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-green-600 dark:text-green-400 underline underline-offset-2 hover:text-green-500 dark:hover:text-green-300 transition-colors duration-200"
          >
            SLRTCE
          </a>
          </p>
        </div>

        {/* What is this project */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10 mb-12 animate-fade-in">
          <h2 className="text-3xl font-bold mb-5 text-gray-800 dark:text-white">What is AnnaSampada?</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-base">
            AnnaSampada is a platform we created as part of our college semester project. The idea behind it is simple — 
            there is a lot of food that goes to waste, not because people are careless, but because there is no good 
            way to manage the surplus. We wanted to fix that.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
            Our platform connects people who have extra food with NGOs, food banks, and composting services — so that 
            food that would otherwise be thrown away can actually be used. Nothing fancy, just making sure food reaches 
            where it is needed.
          </p>
        </div>

        {/* Why we built it */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">Why We Built This</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((val, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 flex flex-col gap-4 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in"
                style={{ animationDelay: `${idx * 0.15}s`, animationFillMode: 'both' }}
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-700">
                  {val.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{val.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{val.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* A small note */}
        <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/30 dark:to-teal-900/30 border border-green-200 dark:border-green-700 rounded-3xl p-8 mb-12 text-center animate-fade-in">
          <p className="text-gray-700 dark:text-gray-200 text-base leading-relaxed italic max-w-2xl mx-auto">
            "Food gives your body the energy to do everything — to think, to work, to live. Be grateful for what you 
            have, and let's make sure we don't waste what others could use."
          </p>
        </div>

        {/* Meet the Team */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10 animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <Users className="w-7 h-7 text-green-500" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">The Team</h2>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
            This project was built by four students of{' '}
            <a
              href="https://slrtce.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-green-600 dark:text-green-400 underline underline-offset-2 hover:text-green-500 dark:hover:text-green-300 transition-colors duration-200"
            >
              Shree L.R. Tiwari College of Engineering (SLRTCE)
            </a>{' '}
            as part of our semester coursework.{' '}
            It started as an idea to solve a real problem and turned into something we're proud of.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Avatar with initials */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-xl font-bold mb-3 shadow-md">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <p className="font-semibold text-gray-800 dark:text-white text-sm">{member.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
