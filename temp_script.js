const fs = require('fs');

// Read the game.js file
fs.readFile('game.js', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // Make character 3x bigger
  let updatedData = data.replace(
    /player: \{\s*x: 100,\s*y: 300,\s*width: 80,\s*height: 100,/g, 
    "player: {\n        x: 100,\n        y: 450,\n        width: 240,\n        height: 300,"
  );

  // Adjust the lanes to move them lower on the screen
  updatedData = updatedData.replace(
    /lanes: \[\s*\{ y: 200 \},\s*\/\/ Top lane\s*\{ y: 300 \},\s*\/\/ Middle lane\s*\{ y: 400 \}/g,
    "lanes: [\n        { y: 350 }, // Top lane\n        { y: 450 }, // Middle lane\n        { y: 550 }"
  );
  
  // Increase collectible size
  updatedData = updatedData.replace(
    /const collectible = \{\s*x: canvas\.width,\s*y: gameState\.lanes\[lane\]\.y,\s*width: 30,\s*height: 30,/g,
    "const collectible = {\n            x: canvas.width,\n            y: gameState.lanes[lane].y,\n            width: 90,\n            height: 90,"
  );
  
  // Increase obstacle size
  updatedData = updatedData.replace(
    /const obstacle = \{\s*x: canvas\.width,\s*y: gameState\.lanes\[lane\]\.y,\s*width: 40,\s*height: 40,/g,
    "const obstacle = {\n            x: canvas.width,\n            y: gameState.lanes[lane].y,\n            width: 120,\n            height: 120,"
  );
  
  // Fix hitbox calculation and drawing
  updatedData = updatedData.replace(
    /drawHitbox: function\(entity\) \{\s*if \(!debugMode\) return;\s*ctx\.strokeStyle = 'red';\s*ctx\.strokeRect\(entity\.x, entity\.y - entity\.height, entity\.width, entity\.height\);/g,
    "drawHitbox: function(entity) {\n        if (!debugMode) return;\n        ctx.strokeStyle = 'red';\n        ctx.strokeRect(entity.x, entity.y, entity.width, entity.height);"
  );
  
  // Fix collision detection
  updatedData = updatedData.replace(
    /checkCollision: function\(entity1, entity2\) \{\s*return \(\s*entity1\.x < entity2\.x \+ entity2\.width &&\s*entity1\.x \+ entity1\.width > entity2\.x &&\s*entity1\.y - entity1\.height < entity2\.y &&\s*entity1\.y > entity2\.y - entity2\.height\s*\);/g,
    "checkCollision: function(entity1, entity2) {\n        return (\n            entity1.x < entity2.x + entity2.width &&\n            entity1.x + entity1.width > entity2.x &&\n            entity1.y < entity2.y + entity2.height &&\n            entity1.y + entity1.height > entity2.y\n        );"
  );
  
  // Fix drawPlayerSprite
  updatedData = updatedData.replace(
    /drawPlayerSprite: function\(sprite, frameX, frameY, canvasX, canvasY\) \{\s*const spriteWidth = sprite\.width \/ SPRITE_FRAMES\.x;\s*const spriteHeight = sprite\.height \/ SPRITE_FRAMES\.y;\s*ctx\.drawImage\(\s*sprite,\s*frameX \* spriteWidth,\s*frameY \* spriteHeight,\s*spriteWidth,\s*spriteHeight,\s*canvasX,\s*canvasY - spriteHeight,\s*gameState\.player\.width,\s*gameState\.player\.height\s*\);/g,
    "drawPlayerSprite: function(sprite, frameX, frameY, canvasX, canvasY) {\n        const spriteWidth = sprite.width / SPRITE_FRAMES.x;\n        const spriteHeight = sprite.height / SPRITE_FRAMES.y;\n        ctx.drawImage(\n            sprite,\n            frameX * spriteWidth,\n            frameY * spriteHeight,\n            spriteWidth,\n            spriteHeight,\n            canvasX,\n            canvasY,\n            gameState.player.width,\n            gameState.player.height\n        );"
  );

  // Write the updated content back to the file
  fs.writeFile('game.js', updatedData, (writeErr) => {
    if (writeErr) {
      console.error('Error writing file:', writeErr);
      return;
    }
    console.log('Successfully updated game.js with new character and item sizes!');
  });
});

