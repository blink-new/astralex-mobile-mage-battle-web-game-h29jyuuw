import React, { useState, useEffect, useCallback } from 'react';
import { blink } from '../blink/client';
import { 
  Users, 
  Crown, 
  Shield, 
  Swords, 
  Plus,
  MessageCircle,
  Trophy,
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Character {
  id: string;
  username: string;
  element: string;
  level: number;
  gold: number;
  mana: number;
  turns: number;
  diamonds: number;
}

interface Guild {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  maxMembers: number;
  level: number;
  element?: string;
  isPublic: boolean;
  leaderName: string;
}

interface GuildSystemProps {
  character: Character;
}

const availableGuilds: Guild[] = [
  {
    id: 'fire_legion',
    name: 'Fire Legion',
    description: 'Masters of flame and destruction unite!',
    memberCount: 24,
    maxMembers: 50,
    level: 15,
    element: 'fire',
    isPublic: true,
    leaderName: 'Pyroblast'
  },
  {
    id: 'water_guardians',
    name: 'Water Guardians',
    description: 'Protectors of the ancient seas',
    memberCount: 18,
    maxMembers: 40,
    level: 12,
    element: 'water',
    isPublic: true,
    leaderName: 'Tidecaller'
  },
  {
    id: 'nature_circle',
    name: 'Nature Circle',
    description: 'In harmony with the natural world',
    memberCount: 31,
    maxMembers: 60,
    level: 18,
    element: 'nature',
    isPublic: true,
    leaderName: 'Thornweaver'
  },
  {
    id: 'light_covenant',
    name: 'Light Covenant',
    description: 'Bearers of divine radiance',
    memberCount: 15,
    maxMembers: 30,
    level: 20,
    element: 'light',
    isPublic: true,
    leaderName: 'Dawnbringer'
  },
  {
    id: 'shadow_syndicate',
    name: 'Shadow Syndicate',
    description: 'Embrace the darkness within',
    memberCount: 27,
    maxMembers: 45,
    level: 16,
    element: 'dark',
    isPublic: true,
    leaderName: 'Voidwalker'
  },
  {
    id: 'arcane_academy',
    name: 'Arcane Academy',
    description: 'Knowledge seekers from all elements',
    memberCount: 42,
    maxMembers: 80,
    level: 22,
    isPublic: true,
    leaderName: 'Spellweaver'
  }
];

const elementColors = {
  fire: 'text-orange-400',
  water: 'text-blue-400',
  nature: 'text-green-400',
  light: 'text-yellow-400',
  dark: 'text-purple-400'
};

export default function GuildSystem({ character }: GuildSystemProps) {
  const [userGuild, setUserGuild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'my-guild'>('browse');

  const loadUserGuild = useCallback(async () => {
    try {
      // Get the current user first
      const user = await blink.auth.me();
      const guilds = await blink.db.guild_members.list({
        where: { userId: user.id },
        limit: 1
      });
      
      if (guilds.length > 0) {
        setUserGuild(guilds[0]);
        setActiveTab('my-guild');
      }
    } catch (error) {
      console.error('Error loading guild:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserGuild();
  }, [loadUserGuild]);

  const joinGuild = async (guild: Guild) => {
    setJoining(guild.id);
    
    try {
      // Get the current user first
      const user = await blink.auth.me();
      // Create guild membership
      await blink.db.guild_members.create({
        id: `guild_member_${Date.now()}`,
        userId: user.id,
        guildId: guild.id,
        role: 'member',
        joinedAt: new Date().toISOString()
      });

      toast.success(`Joined ${guild.name}!`);
      loadUserGuild();
    } catch (error) {
      console.error('Error joining guild:', error);
      toast.error('Failed to join guild');
    } finally {
      setJoining(null);
    }
  };

  const leaveGuild = async () => {
    if (!userGuild) return;
    
    try {
      await blink.db.guild_members.delete(userGuild.id);
      setUserGuild(null);
      setActiveTab('browse');
      toast.success('Left guild successfully');
    } catch (error) {
      console.error('Error leaving guild:', error);
      toast.error('Failed to leave guild');
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-400">Loading guilds...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
        <h2 className="text-xl font-bold text-white mb-1">Guild Hall</h2>
        <p className="text-gray-400 text-sm">Join forces with other mages</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'browse'
              ? 'bg-green-500 text-white'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
          }`}
        >
          Browse Guilds
        </button>
        <button
          onClick={() => setActiveTab('my-guild')}
          disabled={!userGuild}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'my-guild' && userGuild
              ? 'bg-green-500 text-white'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 disabled:opacity-50'
          }`}
        >
          My Guild
        </button>
      </div>

      {activeTab === 'browse' && (
        <div className="space-y-4">
          {userGuild && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-blue-400 text-sm text-center">
                ℹ️ You are already a member of a guild. Leave your current guild to join another.
              </p>
            </div>
          )}

          {availableGuilds.map((guild) => {
            const isJoining = joining === guild.id;
            const canJoin = !userGuild && guild.memberCount < guild.maxMembers;
            
            return (
              <div key={guild.id} className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="text-green-400 mr-3">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-white font-semibold mr-2">{guild.name}</h3>
                        {guild.element && (
                          <span className={`text-xs px-2 py-1 rounded ${elementColors[guild.element as keyof typeof elementColors]} bg-gray-700/30`}>
                            {guild.element}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">{guild.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs">
                        <span className="text-gray-500">
                          <Crown className="w-3 h-3 inline mr-1" />
                          {guild.leaderName}
                        </span>
                        <span className="text-gray-500">
                          Level {guild.level}
                        </span>
                        <span className="text-gray-500">
                          {guild.memberCount}/{guild.maxMembers} members
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="w-full bg-gray-700 rounded-full h-2 mr-4">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(guild.memberCount / guild.maxMembers) * 100}%` }}
                    />
                  </div>
                  
                  <button
                    onClick={() => joinGuild(guild)}
                    disabled={!canJoin || isJoining}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center whitespace-nowrap"
                  >
                    {isJoining ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Joining...
                      </>
                    ) : guild.memberCount >= guild.maxMembers ? (
                      'Full'
                    ) : userGuild ? (
                      'In Guild'
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-1" />
                        Join
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'my-guild' && userGuild && (
        <div className="space-y-4">
          {/* Guild Info */}
          <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
            <div className="text-center mb-4">
              <Shield className="w-12 h-12 text-green-400 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-white">
                {availableGuilds.find(g => g.id === userGuild.guildId)?.name || 'Unknown Guild'}
              </h3>
              <p className="text-gray-400 text-sm">
                {availableGuilds.find(g => g.id === userGuild.guildId)?.description}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <p className="text-blue-400 font-semibold">
                  {availableGuilds.find(g => g.id === userGuild.guildId)?.memberCount || 0}
                </p>
                <p className="text-gray-400">Members</p>
              </div>
              <div className="text-center">
                <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <p className="text-yellow-400 font-semibold">
                  {availableGuilds.find(g => g.id === userGuild.guildId)?.level || 0}
                </p>
                <p className="text-gray-400">Guild Level</p>
              </div>
            </div>
          </div>

          {/* Guild Features */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold">Guild Features</h3>
            
            <button className="w-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-lg p-4 text-left transition-colors">
              <div className="flex items-center">
                <MessageCircle className="w-6 h-6 text-blue-400 mr-3" />
                <div>
                  <p className="text-white font-semibold">Guild Chat</p>
                  <p className="text-gray-400 text-sm">Communicate with guild members</p>
                </div>
              </div>
            </button>
            
            <button className="w-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-lg p-4 text-left transition-colors">
              <div className="flex items-center">
                <Swords className="w-6 h-6 text-red-400 mr-3" />
                <div>
                  <p className="text-white font-semibold">Guild Wars</p>
                  <p className="text-gray-400 text-sm">Participate in alliance battles</p>
                </div>
              </div>
            </button>
            
            <button className="w-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-lg p-4 text-left transition-colors">
              <div className="flex items-center">
                <Trophy className="w-6 h-6 text-yellow-400 mr-3" />
                <div>
                  <p className="text-white font-semibold">Guild Rankings</p>
                  <p className="text-gray-400 text-sm">View guild leaderboards</p>
                </div>
              </div>
            </button>
          </div>

          {/* Leave Guild */}
          <div className="pt-4 border-t border-gray-600">
            <button
              onClick={leaveGuild}
              className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg font-semibold transition-colors"
            >
              Leave Guild
            </button>
          </div>
        </div>
      )}

      {activeTab === 'my-guild' && !userGuild && (
        <div className="text-center py-8">
          <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No Guild</h3>
          <p className="text-gray-400 text-sm mb-4">
            You haven't joined a guild yet. Browse available guilds to find your perfect match!
          </p>
          <button
            onClick={() => setActiveTab('browse')}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            Browse Guilds
          </button>
        </div>
      )}
    </div>
  );
}