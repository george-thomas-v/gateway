interface Tag {
  name: string;
  description?: string;
}

const auth: Tag = {
  name: 'Auth',
  description: 'Authentication',
};

const user: Tag = {
  name: 'User',
  description: 'User analytics',
};

export const tags = {
  auth,
  user,
};
