'use client';

import { useState } from 'react';

interface InputTerminalProps {
  onSearch: (query: string) => void;
}

export default function InputTerminal({ onSearch }: InputTerminalProps) {
  const [command, setCommand] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(command);
    setCommand('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center w-full">
      <span className="text-gray-800 mr-2">SCP-</span>
      <input
        type="text"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        className="bg-transparent border-none text-gray-800 focus:outline-none w-full"
        placeholder="Enter number (e.g., 173, 682, 3812)..."
        autoFocus
      />
    </form>
  );
}