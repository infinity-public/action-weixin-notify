const core = require('@actions/core');
const github = require('@actions/github');
const context = github.context;

async function run() {
  try {
    const notifyUrl = core.getInput('notify-url');
    const notifyProject = core.getInput('notify-project');
    const deploySuccess = core.getInput('deploy-success');

    if (!notifyUrl || !notifyProject || !deploySuccess) {
      core.warning('缺少必要的输入参数。');
      return false;
    }

    // 获取当前分支
    const branch = context.ref.replace('refs/heads/', '');
    const mainBranchs = ['main', 'master'];
    const titleLevel = mainBranchs.includes(branch) ? '#' : '######';
    const titleText = deploySuccess === 'true' ? `${branch}部署成功` : `${branch}部署失败`;
    const titleColor = deploySuccess === 'true' ? 'info' : '#ff0000';
    const { owner, repo } = context.repo;
    // 动态生成 Action 链接
    const actionUrl = `${context.serverUrl}/${owner}/${repo}/actions/runs/${context.runId}`;

    const contentArr = [
      `${titleLevel} <font color="${titleColor}">${titleText}</font>`,
      `项目: **${notifyProject}**`,
      `Action详情: [查看详情](${actionUrl})`,
    ];

    if (context.payload.pull_request && context.payload.pull_request.body) {
      const prBody = context.payload.pull_request.body;
      const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/g;
      const links = [];
      let match;
      while ((match = markdownLinkRegex.exec(prBody)) !== null) {
        links.push({ text: match[1], url: match[2] });
      }

      if (links.length > 0) {
        const linkArr = links.map((link) => `[${link.text}](${link.url})`).join(', ');
        contentArr.push(`关联: ${linkArr}`);
      }
    }
    
    try {
      const response = await fetch(notifyUrl, {
        signal: AbortSignal.timeout(5000),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          msgtype: 'markdown',
          markdown: {
            content: contentArr.join('\n'),
          },
        }),
      });
      if (response.ok) {
        const json = await response.json();
        if (json.errcode === 0) {
          core.info(`发送成功: ${titleText}`);
        }
      } else {
        core.warning(
          `发送失败: ${titleText}, HTTP 状态: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      core.warning(`发送失败: ${titleText}, 错误信息: ${error.message}`);
    }
  } catch (error) {
    core.warning(`捕获错误: ${error.message}`);
  }
}

run();
