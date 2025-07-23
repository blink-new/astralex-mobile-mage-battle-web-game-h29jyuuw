import React, { useState } from 'react';
import { MessageCircle, X, HelpCircle, Book, Building, Swords, Users } from 'lucide-react';

const helpTopics = [
  {
    id: 'buildings',
    title: 'Building Management',
    icon: <Building className="w-4 h-4" />,
    content: `**Building Types:**
• **Ethereal Vault** - Generates gold over time
• **Arcane Library** - Speeds up spell research
• **Astral Sanctum** - Increases mana capacity
• **Crystal Observatory** - Provides battle intelligence

**Tips:**
• Upgrade costs increase by 50% per level
• Higher level buildings provide better bonuses
• Balance your resource generation with research needs`
  },
  {
    id: 'spells',
    title: 'Spell Research',
    icon: <Book className="w-4 h-4" />,
    content: `**Spell Categories:**
• **Attack Spells** - Direct damage (6 slots max)
• **Aura Spells** - Passive bonuses (3 slots max)
• **Speed Spells** - Turn order effects (3 slots max)
• **Counter Spells** - Defensive reactions

**Research Tips:**
• Some spells require prerequisites
• Ultimate spells are element-restricted
• Higher tier spells cost more gold and turns`
  },
  {
    id: 'combat',
    title: 'Battle System',
    icon: <Swords className="w-4 h-4" />,
    content: `**Battle Mechanics:**
• Turn-based combat with mana management
• Damage = Base Damage - Enemy Defense
• Victory rewards gold and experience

**Combat Tips:**
• Research spells before battling
• Manage your mana carefully
• Different enemies have different weaknesses
• Higher level enemies give better rewards`
  },
  {
    id: 'guilds',
    title: 'Guild System',
    icon: <Users className="w-4 h-4" />,
    content: `**Guild Benefits:**
• Access to guild chat
• Participate in guild wars
• Shared guild bonuses
• Social interaction with other players

**Guild Tips:**
• Choose a guild that matches your element
• Active guilds provide better benefits
• Guild level affects available features
• You can only be in one guild at a time`
  },
  {
    id: 'resources',
    title: 'Resource Management',
    icon: <HelpCircle className="w-4 h-4" />,
    content: `**Resources:**
• **Gold** - Used for building and spell research
• **Mana** - Required for casting spells in battle
• **Turns** - Needed for construction and research
• **Diamonds** - Premium currency for special features

**Resource Tips:**
• Build Ethereal Vaults for steady gold income
• Astral Sanctums increase your mana pool
• Plan your spending carefully
• Diamonds can convert to turns (1:10 ratio)`
  }
];

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSelectedTopic(null);
    }
  };

  const selectedTopicData = helpTopics.find(topic => topic.id === selectedTopic);

  return (
    <>
      {/* Chat Bubble */}
      <button
        onClick={toggleChat}
        className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-full shadow-lg transition-colors flex items-center justify-center z-50"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 w-80 max-w-[calc(100vw-2rem)] bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-40">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-4 rounded-t-lg">
            <h3 className="font-semibold">Magical Assistant</h3>
            <p className="text-sm opacity-90">How can I help you master AstralEX?</p>
          </div>

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {!selectedTopic ? (
              <div className="space-y-3">
                <p className="text-gray-300 text-sm mb-4">
                  Choose a topic to learn more about AstralEX:
                </p>
                
                {helpTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className="w-full bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 rounded-lg p-3 text-left transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="text-purple-400 mr-3">
                        {topic.icon}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{topic.title}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-purple-400 mr-2">
                      {selectedTopicData?.icon}
                    </div>
                    <h4 className="text-white font-semibold">{selectedTopicData?.title}</h4>
                  </div>
                  <button
                    onClick={() => setSelectedTopic(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="text-gray-300 text-sm space-y-2">
                  {selectedTopicData?.content.split('\n').map((line, index) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <p key={index} className="font-semibold text-white mt-3 mb-1">
                          {line.replace(/\*\*/g, '')}
                        </p>
                      );
                    } else if (line.startsWith('• **')) {
                      const parts = line.split('** - ');
                      return (
                        <p key={index} className="ml-2">
                          • <span className="font-medium text-purple-400">{parts[0].replace('• **', '')}</span> - {parts[1]}
                        </p>
                      );
                    } else if (line.startsWith('• ')) {
                      return (
                        <p key={index} className="ml-2">
                          {line}
                        </p>
                      );
                    } else if (line.trim()) {
                      return (
                        <p key={index}>
                          {line}
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>
                
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-600/30 rounded-lg text-sm font-medium transition-colors"
                >
                  Back to Topics
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}