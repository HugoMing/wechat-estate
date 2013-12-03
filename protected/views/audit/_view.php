<?php
/* @var $this AuditController */
/* @var $data Audit */
?>

<div class="view">

	<b><?php echo CHtml::encode($data->getAttributeLabel('id')); ?>:</b>
	<?php echo CHtml::link(CHtml::encode($data->id), array('view', 'id'=>$data->id)); ?>
	<br />

	<b><?php echo CHtml::encode($data->getAttributeLabel('entity_id')); ?>:</b>
	<?php echo CHtml::encode($data->entity_id); ?>
	<br />

	<b><?php echo CHtml::encode($data->getAttributeLabel('entity_type')); ?>:</b>
	<?php echo CHtml::encode($data->entity_type); ?>
	<br />

	<b><?php echo CHtml::encode($data->getAttributeLabel('entity_status')); ?>:</b>
	<?php echo CHtml::encode($data->entity_status); ?>
	<br />

	<b><?php echo CHtml::encode($data->getAttributeLabel('operator_id')); ?>:</b>
	<?php echo CHtml::encode($data->operator_id); ?>
	<br />

	<b><?php echo CHtml::encode($data->getAttributeLabel('admin_id')); ?>:</b>
	<?php echo CHtml::encode($data->admin_id); ?>
	<br />

	<b><?php echo CHtml::encode($data->getAttributeLabel('reserved_field_1')); ?>:</b>
	<?php echo CHtml::encode($data->reserved_field_1); ?>
	<br />

	<?php /*
	<b><?php echo CHtml::encode($data->getAttributeLabel('reserved_field_2')); ?>:</b>
	<?php echo CHtml::encode($data->reserved_field_2); ?>
	<br />

	*/ ?>

</div>