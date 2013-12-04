<?php
/* @var $this AuditController */
/* @var $model Audit */
/* @var $form CActiveForm */
?>

<div class="form">

<?php $form=$this->beginWidget('CActiveForm', array(
	'id'=>'audit-form',
	// Please note: When you enable ajax validation, make sure the corresponding
	// controller action is handling ajax validation correctly.
	// There is a call to performAjaxValidation() commented in generated controller code.
	// See class documentation of CActiveForm for details on this.
	'enableAjaxValidation'=>false,
)); ?>

	<p class="note">Fields with <span class="required">*</span> are required.</p>

	<?php echo $form->errorSummary($model); ?>

	<div class="row">
		<?php echo $form->labelEx($model,'entity_id'); ?>
		<?php echo $form->textField($model,'entity_id'); ?>
		<?php echo $form->error($model,'entity_id'); ?>
	</div>

	<div class="row">
		<?php echo $form->labelEx($model,'entity_type'); ?>
		<?php echo $form->textField($model,'entity_type',array('size'=>11,'maxlength'=>11)); ?>
		<?php echo $form->error($model,'entity_type'); ?>
	</div>

	<div class="row">
		<?php echo $form->labelEx($model,'entity_status'); ?>
		<?php echo $form->textField($model,'entity_status',array('size'=>1,'maxlength'=>1)); ?>
		<?php echo $form->error($model,'entity_status'); ?>
	</div>

	<div class="row">
		<?php echo $form->labelEx($model,'operator_id'); ?>
		<?php echo $form->textField($model,'operator_id'); ?>
		<?php echo $form->error($model,'operator_id'); ?>
	</div>

	<div class="row">
		<?php echo $form->labelEx($model,'admin_id'); ?>
		<?php echo $form->textField($model,'admin_id'); ?>
		<?php echo $form->error($model,'admin_id'); ?>
	</div>

	<div class="row">
		<?php echo $form->labelEx($model,'reserved_field_1'); ?>
		<?php echo $form->textField($model,'reserved_field_1',array('size'=>45,'maxlength'=>45)); ?>
		<?php echo $form->error($model,'reserved_field_1'); ?>
	</div>

	<div class="row">
		<?php echo $form->labelEx($model,'reserved_field_2'); ?>
		<?php echo $form->textField($model,'reserved_field_2',array('size'=>45,'maxlength'=>45)); ?>
		<?php echo $form->error($model,'reserved_field_2'); ?>
	</div>

	<div class="row buttons">
		<?php echo CHtml::submitButton($model->isNewRecord ? 'Create' : 'Save'); ?>
	</div>

<?php $this->endWidget(); ?>

</div><!-- form -->