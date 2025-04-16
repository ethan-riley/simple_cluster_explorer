// src/components/ClusterDetails.jsx
import React from 'react';
import ClusterLayout from './ClusterLayout';
import { apiService } from '../services/apiService';

// Mock API service if not available
// This is just a placeholder for the real implementation
if (!window.apiService) {
  window.apiService = {
    getCachedSnapshot: () => null,
    loadClusterSnapshot: async () => {
      // Return mock data structure for development
      return {
        data: {}
      };
    },
    getResources: async (resourceType, filters = {}) => {
      // Generate some mock resources based on type
      const count = Math.floor(Math.random() * 10) + 5;
      const resources = [];
      
      for (let i = 0; i < count; i++) {
        const resource = {
          metadata: {
            name: `${resourceType}-${i + 1}`,
            namespace: ['default', 'kube-system', 'monitoring', 'logging'][Math.floor(Math.random() * 4)],
            uid: `uid-${Math.random().toString(36).substring(2, 15)}`,
            creationTimestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            labels: {
              app: ['frontend', 'backend', 'database', 'cache'][Math.floor(Math.random() * 4)],
              tier: ['web', 'api', 'data', 'infra'][Math.floor(Math.random() * 4)],
              environment: ['dev', 'test', 'staging', 'prod'][Math.floor(Math.random() * 4)]
            }
          },
          spec: {}
        };
        
        // Add type-specific fields
        switch (resourceType) {
          case 'nodes':
            resource.status = {
              capacity: {
                cpu: `${Math.floor(Math.random() * 32) + 1}`,
                memory: `${Math.floor(Math.random() * 64) + 16}Gi`
              },
              nodeInfo: {
                kubeletVersion: 'v1.29.13',
                osImage: 'Amazon Linux 2',
                containerRuntimeVersion: 'containerd://1.7.27',
                kernelVersion: '5.15.179-121.185',
                architecture: 'amd64'
              },
              conditions: [
                {
                  type: 'Ready',
                  status: 'True',
                  lastHeartbeatTime: new Date().toISOString(),
                  lastTransitionTime: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
                  reason: 'KubeletReady',
                  message: 'kubelet is ready'
                }
              ]
            };
            resource.metadata.labels = {
              ...resource.metadata.labels,
              'beta.kubernetes.io/arch': 'amd64',
              'beta.kubernetes.io/os': 'linux',
              'beta.kubernetes.io/instance-type': ['m7a.medium', 'm6i.large', 'c5.xlarge'][Math.floor(Math.random() * 3)],
              'kubernetes.io/arch': 'amd64',
              'kubernetes.io/os': 'linux',
              'kubernetes.io/hostname': `ip-10-30-${Math.floor(Math.random() * 255)}-${Math.floor(Math.random() * 255)}.ec2.internal`,
              'node.kubernetes.io/instance-type': ['m7a.medium', 'm6i.large', 'c5.xlarge'][Math.floor(Math.random() * 3)],
              'topology.kubernetes.io/region': 'us-east-1',
              'topology.kubernetes.io/zone': `us-east-1${['a', 'b', 'c'][Math.floor(Math.random() * 3)]}`,
              'provisioner.cast.ai/managed-by': 'cast.ai'
            };
            break;
            
          case 'namespaces':
            resource.status = {
              phase: 'Active'
            };
            break;
            
          case 'pods':
            resource.spec = {
              nodeName: `ip-10-30-${Math.floor(Math.random() * 255)}-${Math.floor(Math.random() * 255)}.ec2.internal`,
              containers: [
                {
                  name: 'main',
                  image: 'nginx:latest',
                  ports: [{ containerPort: 80, protocol: 'TCP' }],
                  resources: {
                    requests: {
                      cpu: '100m',
                      memory: '128Mi'
                    },
                    limits: {
                      cpu: '200m',
                      memory: '256Mi'
                    }
                  }
                }
              ]
            };
            resource.status = {
              phase: ['Running', 'Running', 'Running', 'Pending', 'Succeeded', 'Failed'][Math.floor(Math.random() * 6)],
              podIP: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
              containerStatuses: [
                {
                  name: 'main',
                  ready: Math.random() > 0.2,
                  restartCount: Math.floor(Math.random() * 5),
                  state: { running: { startedAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString() } }
                }
              ]
            };
            break;
            
          case 'deployments':
            resource.spec = {
              replicas: Math.floor(Math.random() * 10) + 1,
              selector: {
                matchLabels: {
                  app: resource.metadata.labels.app
                }
              },
              strategy: {
                type: ['RollingUpdate', 'Recreate'][Math.floor(Math.random() * 2)]
              }
            };
            resource.status = {
              replicas: resource.spec.replicas,
              availableReplicas: Math.floor(Math.random() * (resource.spec.replicas + 1)),
              readyReplicas: Math.floor(Math.random() * (resource.spec.replicas + 1)),
              conditions: [
                {
                  type: 'Available',
                  status: 'True',
                  lastTransitionTime: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
                  reason: 'MinimumReplicasAvailable',
                  message: 'Deployment has minimum availability.'
                }
              ]
            };
            break;
            
          case 'services':
            resource.spec = {
              type: ['ClusterIP', 'NodePort', 'LoadBalancer'][Math.floor(Math.random() * 3)],
              clusterIP: `10.100.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
              ports: [
                {
                  name: 'http',
                  port: 80,
                  targetPort: 80,
                  protocol: 'TCP'
                }
              ],
              selector: {
                app: resource.metadata.labels.app
              }
            };
            
            if (resource.spec.type === 'LoadBalancer') {
              resource.status = {
                loadBalancer: {
                  ingress: [
                    {
                      hostname: `${resource.metadata.name}-lb.example.com`
                    }
                  ]
                }
              };
            }
            break;
            
          case 'persistentvolumes':
            resource.spec = {
              capacity: {
                storage: `${Math.floor(Math.random() * 100) + 1}Gi`
              },
              accessModes: ['ReadWriteOnce'],
              persistentVolumeReclaimPolicy: ['Retain', 'Delete', 'Recycle'][Math.floor(Math.random() * 3)],
              storageClassName: ['gp2', 'io1', 'sc1'][Math.floor(Math.random() * 3)],
              volumeMode: 'Filesystem'
            };
            resource.status = {
              phase: ['Bound', 'Available', 'Released', 'Failed'][Math.floor(Math.random() * 4)]
            };
            break;
            
          case 'persistentvolumeclaims':
            resource.spec = {
              accessModes: ['ReadWriteOnce'],
              resources: {
                requests: {
                  storage: `${Math.floor(Math.random() * 100) + 1}Gi`
                }
              },
              storageClassName: ['gp2', 'io1', 'sc1'][Math.floor(Math.random() * 3)],
              volumeMode: 'Filesystem'
            };
            resource.status = {
              phase: ['Bound', 'Pending'][Math.floor(Math.random() * 2)],
              capacity: {
                storage: resource.spec.resources.requests.storage
              }
            };
            break;
            
          case 'configmaps':
            resource.data = {
              'app.properties': 'key1=value1\nkey2=value2\nkey3=value3',
              'config.json': '{\n  "database": {\n    "host": "db.example.com",\n    "port": 5432\n  },\n  "cache": {\n    "enabled": true,\n    "ttl": 300\n  }\n}'
            };
            break;
            
          case 'horizontalpodautoscalers':
            resource.spec = {
              scaleTargetRef: {
                apiVersion: 'apps/v1',
                kind: 'Deployment',
                name: `deployment-${Math.floor(Math.random() * 10) + 1}`
              },
              minReplicas: Math.floor(Math.random() * 3) + 1,
              maxReplicas: Math.floor(Math.random() * 10) + 5,
              metrics: [
                {
                  type: 'Resource',
                  resource: {
                    name: 'cpu',
                    target: {
                      type: 'Utilization',
                      averageUtilization: Math.floor(Math.random() * 80) + 20
                    }
                  }
                }
              ]
            };
            resource.status = {
              currentReplicas: Math.floor(Math.random() * 5) + 1,
              desiredReplicas: Math.floor(Math.random() * 5) + 1,
              currentMetrics: [
                {
                  type: 'Resource',
                  resource: {
                    name: 'cpu',
                    current: {
                      averageUtilization: Math.floor(Math.random() * 100),
                      averageValue: `${Math.floor(Math.random() * 500)}m`
                    }
                  }
                }
              ],
              conditions: [
                {
                  type: 'ScalingActive',
                  status: 'True',
                  lastTransitionTime: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
                  reason: 'ValidMetricFound',
                  message: 'the HPA was able to successfully calculate a replica count from cpu resource utilization'
                }
              ]
            };
            break;
            
          default:
            // Generic resource fields
            break;
        }
        
        // Apply filters if any
        if (filters.namespace && resource.metadata.namespace !== filters.namespace) {
          continue;
        }
        
        resources.push(resource);
      }
      
      return resources;
    }
  };
}

const ClusterDetails = () => {
  return <ClusterLayout />;
};

export default ClusterDetails;
