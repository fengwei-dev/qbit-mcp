import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  Tool,
  TextContent,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { QBittorrentClient, TorrentInfo, AppState } from './qbittorrent.js';

// Get configuration from environment variables
const QBIT_URL = process.env.QBIT_URL || 'http://localhost:8080';
const QBIT_USERNAME = process.env.QBIT_USERNAME || 'admin';
const QBIT_PASSWORD = process.env.QBIT_PASSWORD || 'adminPassword';

// Initialize qBittorrent client
const qbClient = new QBittorrentClient(QBIT_URL);

// Initialize MCP server
const server = new Server(
  {
    name: 'qbit-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  },
);

// Define tools
const tools: Tool[] = [
  {
    name: 'list_torrents',
    description: 'Get a list of all torrents with their status',
    inputSchema: {
      type: 'object',
      properties: {
        filter: {
          type: 'string',
          description:
            'Filter torrents by state: all, downloading, seeding, completed, paused, stopped, stalled, checking, error',
          enum: [
            'all',
            'downloading',
            'seeding',
            'completed',
            'paused',
            'stopped',
            'stalled',
            'checking',
            'error',
          ],
        },
      },
    },
  },
  {
    name: 'get_torrent_details',
    description: 'Get detailed information about a specific torrent',
    inputSchema: {
      type: 'object',
      properties: {
        hash: {
          type: 'string',
          description: 'The hash of the torrent',
        },
      },
      required: ['hash'],
    },
  },
  {
    name: 'add_torrent',
    description: 'Add a new torrent from URL or magnet link',
    inputSchema: {
      type: 'object',
      properties: {
        urls: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of torrent URLs or magnet links',
        },
        category: {
          type: 'string',
          description: 'Category to assign to the torrent',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags to assign to the torrent',
        },
        paused: {
          type: 'boolean',
          description: 'Start the torrent in paused state',
        },
        savepath: {
          type: 'string',
          description: 'Save path for the torrent',
        },
      },
      required: ['urls'],
    },
  },
  {
    name: 'remove_torrent',
    description: 'Remove a torrent from qBittorrent',
    inputSchema: {
      type: 'object',
      properties: {
        hash: {
          type: 'string',
          description: 'The hash of the torrent to remove',
        },
        delete_files: {
          type: 'boolean',
          description: 'Delete files associated with the torrent',
          default: false,
        },
      },
      required: ['hash'],
    },
  },
  {
    name: 'pause_torrent',
    description: 'Pause a torrent',
    inputSchema: {
      type: 'object',
      properties: {
        hash: {
          type: 'string',
          description: 'The hash of the torrent to pause',
        },
      },
      required: ['hash'],
    },
  },
  {
    name: 'resume_torrent',
    description: 'Resume a paused torrent',
    inputSchema: {
      type: 'object',
      properties: {
        hash: {
          type: 'string',
          description: 'The hash of the torrent to resume',
        },
      },
      required: ['hash'],
    },
  },
  {
    name: 'get_app_state',
    description: 'Get the current state of the qBittorrent application',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'set_torrent_category',
    description: 'Set the category for a torrent',
    inputSchema: {
      type: 'object',
      properties: {
        hash: {
          type: 'string',
          description: 'The hash of the torrent',
        },
        category: {
          type: 'string',
          description: 'The category name',
        },
      },
      required: ['hash', 'category'],
    },
  },
  {
    name: 'get_categories',
    description: 'Get all available categories',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_tags',
    description: 'Get all available tags',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

// Tool handlers
async function handleListTorrents(filter: string = 'all'): Promise<TextContent> {
  try {
    await qbClient.login(QBIT_USERNAME, QBIT_PASSWORD);
    const torrents = await qbClient.getTorrents(filter);

    if (torrents.length === 0) {
      return {
        type: 'text',
        text: `No torrents found with filter: ${filter}`,
      };
    }

    const summary = torrents
      .map(
        (t, i) =>
          `${i + 1}. ${t.name}
   Hash: ${t.hash}
   State: ${t.state}
   Progress: ${(t.progress * 100).toFixed(2)}%
   Size: ${(t.total_size / 1024 / 1024 / 1024).toFixed(2)} GB
   Download Speed: ${(t.dl_speed / 1024 / 1024).toFixed(2)} MB/s
   Upload Speed: ${(t.up_speed / 1024 / 1024).toFixed(2)} MB/s
   ETA: ${t.eta} seconds
   Category: ${t.category || 'None'}
   Tags: ${t.tags.join(', ') || 'None'}`,
      )
      .join('\n\n');

    return {
      type: 'text',
      text: `Found ${torrents.length} torrent(s):\n\n${summary}`,
    };
  } catch (error) {
    return {
      type: 'text',
      text: `Error listing torrents: ${error}`,
    };
  }
}

async function handleGetTorrentDetails(hash: string): Promise<TextContent> {
  try {
    await qbClient.login(QBIT_USERNAME, QBIT_PASSWORD);
    const torrent = await qbClient.getTorrent(hash);

    if (!torrent) {
      return {
        type: 'text',
        text: `Torrent with hash ${hash} not found`,
      };
    }

    const details = `
Torrent Details:
================
Name: ${torrent.name}
Hash: ${torrent.hash}
State: ${torrent.state}
Progress: ${(torrent.progress * 100).toFixed(2)}%
Total Size: ${(torrent.total_size / 1024 / 1024 / 1024).toFixed(2)} GB
Download Speed: ${(torrent.dl_speed / 1024 / 1024).toFixed(2)} MB/s
Upload Speed: ${torrent.up_speed / 1024 / 1024} MB/s
ETA: ${torrent.eta} seconds
Category: ${torrent.category || 'None'}
Tags: ${torrent.tags.join(', ') || 'None'}
Save Path: ${torrent.save_path}
Added On: ${new Date(torrent.added_on * 1000).toISOString()}
Completed On: ${torrent.completion_on > 0 ? new Date(torrent.completion_on * 1000).toISOString() : 'Not completed'}
    `;

    return {
      type: 'text',
      text: details,
    };
  } catch (error) {
    return {
      type: 'text',
      text: `Error getting torrent details: ${error}`,
    };
  }
}

async function handleAddTorrent(
  urls: string[],
  category?: string,
  tags?: string[],
  paused?: boolean,
  savepath?: string,
): Promise<TextContent> {
  try {
    await qbClient.login(QBIT_USERNAME, QBIT_PASSWORD);
    await qbClient.addTorrent({
      urls,
      category,
      tags,
      paused,
      savepath,
    });

    return {
      type: 'text',
      text: `Successfully added ${urls.length} torrent(s)`,
    };
  } catch (error) {
    return {
      type: 'text',
      text: `Error adding torrent: ${error}`,
    };
  }
}

async function handleRemoveTorrent(hash: string, deleteFiles: boolean = false): Promise<TextContent> {
  try {
    await qbClient.login(QBIT_USERNAME, QBIT_PASSWORD);
    await qbClient.removeTorrent(hash, deleteFiles);

    return {
      type: 'text',
      text: `Sucessfully removed torrent ${hash}${deleteFiles ? ' and deleted files' : ''}`,
    };
  } catch (error) {
    return {
      type: 'text',
      text: `Error removing torrent: ${error}`,
    };
  }
}

async function handlePauseTorrent(hash: string): Promise<TextContent> {
  try {
    await qbClient.login(QBIT_USERNAME, QBIT_PASSWORD);
    await qbClient.pauseTorrent(hash);

    return {
      type: 'text',
      text: `Successfully paused torrent ${hash}`,
    };
  } catch (error) {
    return {
      type: 'text',
      text: `Error pausing torrent: ${error}`,
    };
  }
}

async function handleResumeTorrent(hash: string): Promise<TextContent> {
  try {
    await qbClient.login(QBIT_USERNAME, QBIT_PASSWORD);
    await qbClient.resumeTorrent(hash);

    return {
      type: 'text',
      text: `Successfully resumed torrent ${hash}`,
    };
  } catch (error) {
    return {
      type: 'text',
      text: `Error resuming torrent: ${error}`,
    };
  }
}

async function handleGetAppState(): Promise<TextContent> {
  try {
    await qbClient.login(QBIT_USERNAME, QBIT_PASSWORD);
    const state = await qbClient.getAppState();

    const details = `
qBittorrent App State:
======================
Download Speed: ${(state.dl_info_speed / 1024 / 1024).toFixed(2)} MB/s
Downloaded Data: ${(state.dl_info_data / 1024 / 1024 / 1024).toFixed(2)} GB
Upload Speed: ${(state.up_info_speed / 1024 / 1024).toFixed(2)} MB/s
Uploaded Data: ${(state.up_info_data / 1024 / 1024 / 1024).toFixed(2)} GB
DHT Nodes: ${state.dht_nodes}
Connection Status: ${state.connection_status}
Server State: ${state.server_state}
Queueing: ${state.queueing}
Use Alt Speed Limits: ${state.use_alt_speed_limits}
    `;

    return {
      type: 'text',
      text: details,
    };
  } catch (error) {
    return {
      type: 'text',
      text: `Error getting app state: ${error}`,
    };
  }
}

async function handleSetTorrentCategory(hash: string, category: string): Promise<TextContent> {
  try {
    await qbClient.login(QBIT_USERNAME, QBIT_PASSWORD);
    await qbClient.setCategory(hash, category);

    return {
      type: 'text',
      text: `Successfully set category to "${category}" for torrent ${hash}`,
    };
  } catch (error) {
    return {
      type: 'text',
      text: `Error setting category: ${error}`,
    };
  }
}

async function handleGetCategories(): Promise<TextContent> {
  try {
    await qbClient.login(QBIT_USERNAME, QBIT_PASSWORD);
    const categories = await qbClient.getCategories();

    if (Object.keys(categories).length === 0) {
      return {
        type: 'text',
        text: 'No categories found',
      };
    }

    const categoryList = Object.entries(categories)
      .map(
        ([name, data]: [string, any]) =>
          `- ${name}: ${data.save_path || 'No save path'}`,
      )
      .join('\n');

    return {
      type: 'text',
      text: `Available categories:\n${categoryList}`,
    };
  } catch (error) {
    return {
      type: 'text',
      text: `Error getting categories: ${error}`,
    };
  }
}

async function handleGetTags(): Promise<TextContent> {
  try {
    await qbClient.login(QBIT_USERNAME, QBIT_PASSWORD);
    const tags = await qbClient.getTags();

    if (tags.length === 0) {
      return {
        type: 'text',
        text: 'No tags found',
      };
    }

    return {
      type: 'text',
      text: `Available tags:\n${tags.map((t) => `- ${t}`).join('\n')}`,
    };
  } catch (error) {
    return {
      type: 'text',
      text: `Error getting tags: ${error}`,
    };
  }
}

// Handle tool calls
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  let response: TextContent;

  switch (name) {
    case 'list_torrents':
      response = await handleListTorrents((args as any).filter);
      break;
    case 'get_torrent_details':
      response = await handleGetTorrentDetails((args as any).hash);
      break;
    case 'add_torrent':
      response = await handleAddTorrent(
        (args as any).urls,
        (args as any).category,
        (args as any).tags,
        (args as any).paused,
        (args as any).savepath,
      );
      break;
    case 'remove_torrent':
      response = await handleRemoveTorrent((args as any).hash, (args as any).delete_files);
      break;
    case 'pause_torrent':
      response = await handlePauseTorrent((args as any).hash);
      break;
    case 'resume_torrent':
      response = await handleResumeTorrent((args as any).hash);
      break;
    case 'get_app_state':
      response = await handleGetAppState();
      break;
    case 'set_torrent_category':
      response = await handleSetTorrentCategory((args as any).hash, (args as any).category);
      break;
    case 'get_categories':
      response = await handleGetCategories();
      break;
    case 'get_tags':
      response = await handleGetTags();
      break;
    default:
      response = {
        type: 'text',
        text: `Unknown tool: ${name}`,
      };
  }

  return {
    content: [response],
  };
});

// Handle resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'qbittorrent://torrents/all',
        name: 'All Torrents',
        description: 'List of all torrents',
        mimeType: 'text/plain',
      },
      {
        uri: 'qbittorrent://app/state',
        name: 'App State',
        description: 'Current state of qBittorrent application',
        mimeType: 'application/json',
      },
      {
        uri: 'qbittorrent://categories',
        name: 'Categories',
        description: 'Available torrent categories',
        mimeType: 'application/json',
      },
      {
        uri: 'qbittorrent://tags',
        name: 'Tags',
        description: 'Available torrent tags',
        mimeType: 'application/json',
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  let content = '';
  let mimeType = 'text/plain';

  try {
    await qbClient.login(QBIT_USERNAME, QBIT_PASSWORD);

    if (uri === 'qbittorrent://torrents/all') {
      const torrents = await qbClient.getTorrents('all');
      content = JSON.stringify(torrents, null, 2);
      mimeType = 'application/json';
    } else if (uri === 'qbittorrent://app/state') {
      const state = await qbClient.getAppState();
      content = JSON.stringify(state, null, 2);
      mimeType = 'application/json';
    } else if (uri === 'qbittorrent://categories') {
      const categories = await qbClient.getCategories();
      content = JSON.stringify(categories, null, 2);
      mimeType = 'application/json';
    } else if (uri === 'qbittorrent://tags') {
      const tags = await qbClient.getTags();
      content = JSON.stringify(tags, null, 2);
      mimeType = 'application/json';
    } else {
      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: `Unknown resource: ${uri}`,
          },
        ],
      };
    }
  } catch (error) {
    content = `Error reading resource: ${error}`;
  }

  return {
    contents: [
      {
        uri,
        mimeType,
        text: content,
      },
    ],
  };
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('qBittorrent MCP server started');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
