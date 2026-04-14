import React from 'react';
import { motion } from 'framer-motion';
import { Users, LogIn } from 'lucide-react';

const RoomList = ({ rooms, onJoinRoom }) => {
  return (
    <motion.div 
      className="panel"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Users className="w-5 h-5 text-primary-500" />
        Open Rooms
      </h2>
      
      {rooms.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No active rooms</p>
          <p className="text-sm">Create a room to start playing!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="room-item"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">
                    {room.host}'s Room
                  </div>
                  <div className="text-sm text-gray-500 font-mono">
                    {room.id}
                  </div>
                </div>
                <button
                  onClick={() => onJoinRoom(room.id)}
                  className="px-3 py-1 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <LogIn className="w-3 h-3" />
                  Join
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {rooms.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p>{rooms.length} Active Rooms</p>
            <p className="text-xs mt-1">Click Join to enter</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default RoomList;
export { RoomList };
