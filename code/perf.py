import matplotlib.pyplot as plt
import numpy as np

# Models
models = ['DeBERTaV3', 'RoBERTa', 'XLNet', 'Proposed']

# Metrics
accuracy = [0.91, 0.89, 0.88, 0.95]
precision = [0.90, 0.88, 0.87, 0.94]
recall = [0.89, 0.87, 0.86, 0.93]

f1_score = [0.89, 0.87, 0.86, 0.94]
specificity = [0.92, 0.90, 0.89, 0.96]

fnr = [0.11, 0.13, 0.14, 0.07]
fpr = [0.08, 0.10, 0.11, 0.04]

x = np.arange(len(models))
width = 0.25

# ------------------ FIGURE 1 ------------------
plt.figure(figsize=(7, 4))

plt.bar(x - width, accuracy, width, label='Accuracy')
plt.bar(x, precision, width, label='Precision')
plt.bar(x + width, recall, width, label='Recall')

plt.xticks(x, models)
plt.ylabel('Performance')
plt.ylim(0.6,1.1)
plt.legend(loc='upper right')
plt.grid(axis='y', linestyle='--', alpha=0.7)

plt.tight_layout()
plt.savefig('./graph/model_1.png', dpi=600)
plt.close()

# ------------------ FIGURE 2 ------------------
plt.figure(figsize=(7, 4))

plt.bar(x - width/2, f1_score, width, label='F1 Score')
plt.bar(x + width/2, specificity, width, label='Specificity')

plt.xticks(x, models)
plt.ylabel('Performance')
#plt.title('F1 Score vs Specificity')
plt.legend(loc='upper right')
plt.grid(axis='y', linestyle='--', alpha=0.7)
plt.ylim(0.6,1.1)
plt.tight_layout()
plt.savefig('./graph/model_2.png', dpi=600)
plt.close()

# ------------------ FIGURE 3 ------------------
plt.figure(figsize=(7, 4))

plt.bar(x - width/2, fnr, width, label='FNR')
plt.bar(x + width/2, fpr, width, label='FPR')

plt.xticks(x, models)
plt.ylabel('Error Rate')
#plt.title('FNR vs FPR')
plt.legend(loc='upper right')
plt.grid(axis='y', linestyle='--', alpha=0.7)

plt.tight_layout()
plt.savefig('./graph/model_3.png', dpi=600)
plt.close()


##
#####

models = ['Women cloth','Flipkart','Amazon']

# Metrics
accuracy = [0.95,0.94,0.96]
precision = [0.94,0.93,0.95]
recall = [0.93,0.92,0.94]

f1_score = [0.94,0.92,0.95]
specificity = [0.96,0.95,0.97]

fnr = [0.07,0.08,0.06]
fpr = [0.04,0.05,0.03]

x = np.arange(len(models))
width = 0.25

# ------------------ FIGURE 1 ------------------
plt.figure(figsize=(7, 4))

plt.bar(x - width, accuracy, width, label='Accuracy')
plt.bar(x, precision, width, label='Precision')
plt.bar(x + width, recall, width, label='Recall')

plt.xticks(x, models)
plt.ylabel('Performance')
plt.ylim(0.6,1.1)
plt.legend(loc='upper right')
plt.grid(axis='y', linestyle='--', alpha=0.7)

plt.tight_layout()
plt.savefig('./graph/Dataset_1.png', dpi=600)
plt.close()

# ------------------ FIGURE 2 ------------------
plt.figure(figsize=(7, 4))

plt.bar(x - width/2, f1_score, width, label='F1 Score')
plt.bar(x + width/2, specificity, width, label='Specificity')

plt.xticks(x, models)
plt.ylabel('Performance')
#plt.title('F1 Score vs Specificity')
plt.legend(loc='upper right')
plt.grid(axis='y', linestyle='--', alpha=0.7)
plt.ylim(0.6,1.1)
plt.tight_layout()
plt.savefig('./graph/dataset_2.png', dpi=600)
plt.close()

# ------------------ FIGURE 3 ------------------
plt.figure(figsize=(7, 4))

plt.bar(x - width/2, fnr, width, label='FNR')
plt.bar(x + width/2, fpr, width, label='FPR')

plt.xticks(x, models)
plt.ylabel('Error Rate')
#plt.title('FNR vs FPR')
plt.legend(loc='upper right')
plt.grid(axis='y', linestyle='--', alpha=0.7)

plt.tight_layout()
plt.savefig('./graph/dataset_3.png', dpi=600)
plt.close()



##
#####

models = ['PSO','ACO','ABC','CSO','Proposed']

# Metrics
accuracy = [0.89,0.88,0.9,0.91,0.96]
precision = [0.88,.87,0.89,0.9,0.95]
recall = [0.87,0.86,0.88,0.89,0.94]

f1_score = [0.87,0.86,0.88,0.89,0.95]
specificity = [0.9,0.89,0.91,0.92,0.97]

fnr = [0.13,0.14,0.12,0.11,0.06]
fpr = [0.1,0.11,0.09,0.08,0.03]

x = np.arange(len(models))
width = 0.25

# ------------------ FIGURE 1 ------------------
plt.figure(figsize=(7, 4))

plt.bar(x - width, accuracy, width, label='Accuracy')
plt.bar(x, precision, width, label='Precision')
plt.bar(x + width, recall, width, label='Recall')

plt.xticks(x, models)
plt.ylabel('Performance')
plt.ylim(0.6,1.1)
plt.legend(loc='upper right')
plt.grid(axis='y', linestyle='--', alpha=0.7)

plt.tight_layout()
plt.savefig('./graph/opt_1.png', dpi=600)
plt.close()

# ------------------ FIGURE 2 ------------------
plt.figure(figsize=(7, 4))

plt.bar(x - width/2, f1_score, width, label='F1 Score')
plt.bar(x + width/2, specificity, width, label='Specificity')

plt.xticks(x, models)
plt.ylabel('Performance')
#plt.title('F1 Score vs Specificity')
plt.legend(loc='upper right')
plt.grid(axis='y', linestyle='--', alpha=0.7)
plt.ylim(0.6,1.1)
plt.tight_layout()
plt.savefig('./graph/opt_2.png', dpi=600)
plt.close()

# ------------------ FIGURE 3 ------------------
plt.figure(figsize=(7, 4))

plt.bar(x - width/2, fnr, width, label='FNR')
plt.bar(x + width/2, fpr, width, label='FPR')

plt.xticks(x, models)
plt.ylabel('Error Rate')
#plt.title('FNR vs FPR')
plt.legend(loc='upper right')
plt.grid(axis='y', linestyle='--', alpha=0.7)

plt.tight_layout()
plt.savefig('./graph/opt_3.png', dpi=600)
plt.close()




##
#####

models = ['Without semantic','Without sentiment','Without ESO','Without quantum','Proposed']

# Metrics
accuracy = [0.9,0.91,0.92,0.93,0.96]
precision = [0.89,0.9,0.91,0.92,0.95]
recall = [0.88,0.89,0.9,0.91,0.94]

f1_score = [0.88,0.89,0.9,0.91,0.95]
specificity = [0.91,0.92,0.93,0.94,0.97]

fnr = [0.12,0.11,0.1,0.09,0.06]
fpr = [0.09,0.08,0.07,0.06,0.03]

x = np.arange(len(models))
width = 0.25

# ------------------ FIGURE 1 ------------------
plt.figure(figsize=(7, 4))

plt.bar(x - width, accuracy, width, label='Accuracy')
plt.bar(x, precision, width, label='Precision')
plt.bar(x + width, recall, width, label='Recall')

plt.xticks(x, models,rotation=15)
plt.ylabel('Performance')
plt.ylim(0.6,1.1)
plt.legend(loc='upper right')
plt.grid(axis='y', linestyle='--', alpha=0.7)

plt.tight_layout()
plt.savefig('./graph/abl_1.png', dpi=600)
plt.close()

# ------------------ FIGURE 2 ------------------
plt.figure(figsize=(7, 4))

plt.bar(x - width/2, f1_score, width, label='F1 Score')
plt.bar(x + width/2, specificity, width, label='Specificity')

plt.xticks(x, models,rotation=15)
plt.ylabel('Performance')
#plt.title('F1 Score vs Specificity')
plt.legend(loc='upper right')
plt.grid(axis='y', linestyle='--', alpha=0.7)
plt.ylim(0.6,1.1)
plt.tight_layout()
plt.savefig('./graph/abl_2.png', dpi=600)
plt.close()

# ------------------ FIGURE 3 ------------------
plt.figure(figsize=(7, 4))

plt.bar(x - width/2, fnr, width, label='FNR')
plt.bar(x + width/2, fpr, width, label='FPR')

plt.xticks(x, models,rotation=15)
plt.ylabel('Error Rate')
#plt.title('FNR vs FPR')
plt.legend(loc='upper right')
plt.grid(axis='y', linestyle='--', alpha=0.7)

plt.tight_layout()
plt.savefig('./graph/abl_3.png', dpi=600)
plt.close()
