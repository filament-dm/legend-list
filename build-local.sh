#!/bin/bash
set -e

echo "Building legend-list..."
npx tsup

echo "Running posttsup..."
bun run posttsup.ts

echo "Creating re-export files..."

# Main index files
cat > index.js << 'EOF'
module.exports = require('./dist/index.js');
EOF

cat > index.mjs << 'EOF'
export * from './dist/index.mjs';
EOF

cat > index.native.js << 'EOF'
module.exports = require('./dist/index.native.js');
EOF

# Subpath exports
cat > animated.js << 'EOF'
module.exports = require('./dist/animated.js');
EOF

cat > animated.mjs << 'EOF'
export * from './dist/animated.mjs';
EOF

cat > keyboard.js << 'EOF'
module.exports = require('./dist/keyboard.js');
EOF

cat > keyboard.mjs << 'EOF'
export * from './dist/keyboard.mjs';
EOF

cat > keyboard-controller.js << 'EOF'
module.exports = require('./dist/keyboard-controller.js');
EOF

cat > keyboard-controller.mjs << 'EOF'
export * from './dist/keyboard-controller.mjs';
EOF

cat > reanimated.js << 'EOF'
module.exports = require('./dist/reanimated.js');
EOF

cat > reanimated.mjs << 'EOF'
export * from './dist/reanimated.mjs';
EOF

cat > section-list.js << 'EOF'
module.exports = require('./dist/section-list.js');
EOF

cat > section-list.mjs << 'EOF'
export * from './dist/section-list.mjs';
EOF

echo "Build complete!"
