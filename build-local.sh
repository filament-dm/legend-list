#!/bin/bash
set -e

# Clean dist folder to prevent declaration file conflicts
echo "Cleaning dist folder..."
rm -rf dist

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

cat > index.d.ts << 'EOF'
export * from './dist/index';
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

cat > animated.d.ts << 'EOF'
export * from './dist/animated';
EOF

cat > keyboard.js << 'EOF'
module.exports = require('./dist/keyboard.js');
EOF

cat > keyboard.mjs << 'EOF'
export * from './dist/keyboard.mjs';
EOF

cat > keyboard.d.ts << 'EOF'
export * from './dist/keyboard';
EOF

cat > keyboard-controller.js << 'EOF'
module.exports = require('./dist/keyboard-controller.js');
EOF

cat > keyboard-controller.mjs << 'EOF'
export * from './dist/keyboard-controller.mjs';
EOF

cat > keyboard-controller.d.ts << 'EOF'
export * from './dist/keyboard-controller';
EOF

cat > reanimated.js << 'EOF'
module.exports = require('./dist/reanimated.js');
EOF

cat > reanimated.mjs << 'EOF'
export * from './dist/reanimated.mjs';
EOF

cat > reanimated.d.ts << 'EOF'
export * from './dist/reanimated';
EOF

cat > section-list.js << 'EOF'
module.exports = require('./dist/section-list.js');
EOF

cat > section-list.mjs << 'EOF'
export * from './dist/section-list.mjs';
EOF

cat > section-list.d.ts << 'EOF'
export * from './dist/section-list';
EOF

# Platform-specific exports (new in beta.33)
cat > react-native.js << 'EOF'
module.exports = require('./dist/react-native.js');
EOF

cat > react-native.mjs << 'EOF'
export * from './dist/react-native.mjs';
EOF

cat > react-native.d.ts << 'EOF'
export * from './dist/react-native';
EOF

cat > react.js << 'EOF'
module.exports = require('./dist/react.js');
EOF

cat > react.mjs << 'EOF'
export * from './dist/react.mjs';
EOF

cat > react.d.ts << 'EOF'
export * from './dist/react';
EOF

echo "Build complete!"
