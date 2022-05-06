// jest.framework.dom.ts

import { prosemirrorSerializer } from 'jest-prosemirror';

// Add the serializer for use throughout all the configured test files.
expect.addSnapshotSerializer(prosemirrorSerializer);